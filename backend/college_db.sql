-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 24, 2026 at 08:38 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `college_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `can_register_course` (IN `p_student_id` INT, IN `p_course_id` INT, IN `p_semester_id` INT, OUT `p_result` TINYINT, OUT `p_reason` VARCHAR(500))   check_block: BEGIN
    DECLARE v_prereqs_count INT;
    DECLARE v_prereqs_passed INT;
    DECLARE v_registered_hrs INT;
    DECLARE v_max_hrs INT;
    DECLARE v_already_passed INT;
    DECLARE v_course_credits INT;

    -- تحقق: هل المادة مسجلة أو مجتازة مسبقاً؟
    SELECT COUNT(*) INTO v_already_passed
    FROM enrollments e
    WHERE e.student_id = p_student_id
      AND e.course_id = p_course_id
      AND e.grade_symbol NOT IN ('F','W','Abs','FD','IC')
      AND e.status = 'completed'
      AND e.grade >= 60;

    IF v_already_passed > 0 THEN
        SET p_result = 0;
        SET p_reason = 'الطالب اجتاز هذه المادة مسبقاً';
        LEAVE check_block;  -- ← إصلاح: LEAVE يجب أن يحدد اسم الـ Block
    END IF;

    -- عدد ساعات المادة
    SELECT credit_hours INTO v_course_credits FROM courses WHERE id = p_course_id;

    -- الحد الأقصى للساعات
    SET v_max_hrs = get_max_credits(p_student_id, p_semester_id);

    -- الساعات المسجلة حالياً
    SELECT COALESCE(SUM(c.credit_hours), 0) INTO v_registered_hrs
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = p_student_id
      AND e.semester_id = p_semester_id
      AND e.status = 'registered';

    IF (v_registered_hrs + v_course_credits) > v_max_hrs THEN
        SET p_result = 0;
        SET p_reason = CONCAT('تجاوز الحد الأقصى للساعات (', v_max_hrs, ' ساعة). مسجل حالياً: ', v_registered_hrs);
        LEAVE check_block;  -- ← إصلاح
    END IF;

    -- التحقق من المتطلبات السابقة
    SELECT COUNT(*) INTO v_prereqs_count
    FROM prerequisites WHERE course_id = p_course_id;

    IF v_prereqs_count > 0 THEN
        SELECT COUNT(*) INTO v_prereqs_passed
        FROM prerequisites pr
        WHERE pr.course_id = p_course_id
          AND pr.prereq_id IN (
              SELECT e.course_id FROM enrollments e
              WHERE e.student_id = p_student_id
                AND e.status = 'completed'
                AND e.grade >= 60
                AND e.grade_symbol NOT IN ('F','W','Abs','FD')
          );

        IF v_prereqs_passed < v_prereqs_count THEN
            SET p_result = 0;
            SET p_reason = 'لم يجتز الطالب جميع المتطلبات السابقة للمادة';
            LEAVE check_block;  -- ← إصلاح
        END IF;
    END IF;

    SET p_result = 1;
    SET p_reason = 'يمكن التسجيل';
END check_block$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `get_max_credits` (`p_student_id` INT, `p_semester_id` INT) RETURNS INT(11) READS SQL DATA BEGIN
    DECLARE v_cgpa DECIMAL(5,3);
    DECLARE v_is_first BOOLEAN;
    DECLARE v_term ENUM('fall','spring','summer');
    DECLARE v_max INT;

    SELECT cgpa, is_first_term INTO v_cgpa, v_is_first
    FROM students WHERE id = p_student_id;

    SELECT term INTO v_term
    FROM semesters WHERE id = p_semester_id;

    -- الفصل الصيفي: 9 ساعات كحد أقصى
    IF v_term = 'summer' THEN
        RETURN 9;
    END IF;

    -- الطالب المستجد في فصله الأول: 18 ساعة
    IF v_is_first = TRUE THEN
        RETURN 18;
    END IF;

    -- بناءً على CGPA
    SELECT max_credits INTO v_max
    FROM cgpa_credit_rules
    WHERE v_cgpa >= cgpa_min
      AND (cgpa_max IS NULL OR v_cgpa <= cgpa_max)
    LIMIT 1;

    RETURN COALESCE(v_max, 12);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `cgpa_credit_rules`
--

CREATE TABLE `cgpa_credit_rules` (
  `id` int(11) NOT NULL,
  `cgpa_min` decimal(4,3) NOT NULL,
  `cgpa_max` decimal(4,3) DEFAULT NULL,
  `max_credits` int(11) NOT NULL,
  `description_ar` varchar(200) DEFAULT NULL,
  `description_en` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cgpa_credit_rules`
--

INSERT INTO `cgpa_credit_rules` (`id`, `cgpa_min`, `cgpa_max`, `max_credits`, `description_ar`, `description_en`) VALUES
(1, 0.000, 0.999, 12, 'CGPA أقل من 1', 'CGPA < 1.0'),
(2, 1.000, 1.999, 15, 'CGPA من 1 إلى أقل من 2', 'CGPA >= 1.0 and < 2.0'),
(3, 2.000, 2.999, 18, 'CGPA من 2 إلى أقل من 3', 'CGPA >= 2.0 and < 3.0'),
(4, 3.000, 4.000, 21, 'CGPA 3 فأكثر', 'CGPA >= 3.0');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `code_ar` varchar(30) DEFAULT NULL,
  `code_en` varchar(20) NOT NULL,
  `name_ar` varchar(200) NOT NULL,
  `name_en` varchar(200) NOT NULL,
  `credit_hours` int(11) NOT NULL DEFAULT 3,
  `lecture_hrs` int(11) DEFAULT 2,
  `lab_hrs` int(11) DEFAULT 0,
  `level` int(11) DEFAULT 1,
  `course_type` enum('general_mandatory','general_elective','college_mandatory','college_elective','dept_mandatory','dept_elective','project','training','remedial') NOT NULL,
  `department_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `code_ar`, `code_en`, `name_ar`, `name_en`, `credit_hours`, `lecture_hrs`, `lab_hrs`, `level`, `course_type`, `department_id`) VALUES
(1, 'أنس111', 'HU111', 'لغة إنجليزية 1', 'English I', 2, 2, 0, 1, 'general_mandatory', NULL),
(2, 'أنس212', 'HU212', 'الكتابة العلمية والفنية', 'Technical and Scientific Writing', 2, 2, 0, 3, 'general_mandatory', NULL),
(3, 'أنس313', 'HU313', 'القضايا المجتمعية', 'Social Issues', 0, 2, 0, 3, 'general_mandatory', NULL),
(4, 'أنس113', 'HU113', 'تاريخ الحوسبة', 'History of Computing', 2, 2, 0, 1, 'general_mandatory', NULL),
(5, 'أنس121', 'HU121', 'مبادئ الاقتصاد', 'Fundamentals of Economics', 3, 3, 0, 1, 'general_elective', NULL),
(6, 'أنس122', 'HU122', 'مبادئ الإدارة', 'Fundamentals of Management', 3, 3, 0, 1, 'general_elective', NULL),
(7, 'أنس323', 'HU323', 'مبادئ المحاسبة', 'Fundamentals of Accounting', 3, 3, 0, 3, 'general_elective', NULL),
(8, 'أنس331', 'HU331', 'مهارات التفاوض والاتصال', 'Communication & Negotiation Skills', 3, 3, 0, 3, 'general_elective', NULL),
(9, 'أنس432', 'HU432', 'التفكير الإبداعي', 'Creative Thinking', 3, 3, 0, 4, 'general_elective', NULL),
(10, 'أنس333', 'HU333', 'الإعلام', 'Mass Communication', 3, 3, 0, 3, 'general_elective', NULL),
(11, 'أنس434', 'HU434', 'أخلاقيات المهنة', 'Professional Ethics', 3, 3, 0, 4, 'general_elective', NULL),
(12, 'أسس111', 'BS111', 'تفاضل وتكامل', 'Calculus', 3, 2, 2, 1, 'college_mandatory', NULL),
(13, 'أسس112', 'BS112', 'جبر خطي', 'Linear Algebra', 3, 2, 2, 1, 'college_mandatory', NULL),
(14, 'أسس121', 'BS121', 'إحصاء واحتمالات', 'Probability and Statistics', 3, 2, 2, 1, 'college_mandatory', NULL),
(15, 'أسس211', 'BS211', 'تحليل عددي', 'Numerical Analysis', 3, 2, 2, 2, 'college_mandatory', NULL),
(16, 'أسس113', 'BS113', 'فيزياء', 'Physics', 3, 2, 2, 1, 'college_mandatory', NULL),
(17, 'تقن111', 'IT111', 'إلكترونيات 1', 'Electronics', 3, 2, 2, 1, 'college_mandatory', NULL),
(18, 'حسب111', 'CS111', 'مقدمة في الحاسبات', 'Introduction to Computers', 3, 2, 2, 1, 'college_mandatory', NULL),
(19, 'حسب112', 'CS112', 'برمجة هيكلية', 'Structure Programming', 3, 2, 2, 1, 'college_mandatory', NULL),
(20, 'حسب113', 'CS113', 'تراكيب محددة', 'Discrete Structure', 3, 2, 2, 1, 'college_mandatory', NULL),
(21, 'حسب110', 'CS110', 'البرمجة الشيئية', 'Object Programming', 3, 2, 2, 2, 'college_mandatory', NULL),
(22, 'حسب214', 'CS214', 'هياكل البيانات', 'Data Structures', 3, 2, 2, 2, 'college_mandatory', NULL),
(23, 'حسب216', 'CS216', 'تحليل وتصميم الخوارزميات', 'Analysis and Design of Algorithms', 3, 2, 2, 2, 'college_mandatory', NULL),
(24, 'حسب221', 'CS221', 'تصميم منطقي رقمي', 'Digital Logic Design', 3, 2, 2, 2, 'college_mandatory', NULL),
(25, 'حسب241', 'CS241', 'مقدمة نظم التشغيل', 'Introduction to Operating Systems', 3, 2, 2, 2, 'college_mandatory', NULL),
(26, 'حسب252', 'CS252', 'هندسة البرمجيات', 'Software Engineering', 3, 2, 2, 2, 'college_mandatory', NULL),
(27, 'حسب261', 'CS261', 'مقدمة الذكاء الاصطناعي', 'Introduction to Artificial Intelligence', 3, 2, 2, 2, 'college_mandatory', NULL),
(28, 'تقن221', 'IT221', 'تراسل البيانات', 'Data Communication', 3, 2, 2, 2, 'college_mandatory', NULL),
(29, 'تقن222', 'IT222', 'شبكات الحاسبات', 'Computer Networks', 3, 2, 2, 2, 'college_mandatory', NULL),
(30, 'نال212', 'IS212', 'نظم قواعد البيانات', 'Database Systems', 3, 2, 2, 2, 'college_mandatory', NULL),
(31, 'نال142', 'IS142', 'مقدمة نظم المعلومات', 'Introduction to Information Systems', 3, 2, 2, 1, 'college_mandatory', NULL),
(32, 'نال115', 'IS115', 'مقدمة تحليل وتصميم نظم المعلومات', 'Introduction to System Analysis and Design', 3, 2, 2, 1, 'college_mandatory', NULL),
(33, 'نال221', 'IS221', 'برمجة الويب', 'Web Programming', 3, 2, 2, 2, 'college_mandatory', NULL),
(34, 'أسس122', 'BS122', 'إحصاء واحتمالات 2', 'Probability and Statistics 2', 3, 2, 2, 2, 'college_elective', NULL),
(35, 'نال321', 'IS321', 'إدارة المشروعات', 'Projects Management', 3, 2, 2, 3, 'college_elective', NULL),
(36, 'تقن211', 'IT211', 'صيانة الحاسب', 'Computer Maintenance', 3, 2, 2, 2, 'college_elective', NULL),
(37, 'تقن141', 'IT141', 'مقدمة تكنولوجيا المعلومات', 'Introduction to Information Technology', 3, 2, 2, 1, 'college_elective', NULL),
(38, 'حسب255', 'CS255', 'البرمجيات مفتوحة المصدر', 'Open Source Software', 3, 2, 2, 2, 'college_elective', NULL),
(39, 'نال251', 'IS251', 'بحوث العمليات', 'Operations Research', 3, 2, 2, 2, 'college_elective', NULL),
(40, 'حسب311', 'CS311', 'تعلم الآلة', 'Machine Learning', 3, 2, 2, 3, 'dept_mandatory', 1),
(41, 'حسب312', 'CS312', 'الحوسبة المرنة', 'Soft Computing', 3, 2, 2, 3, 'dept_mandatory', 1),
(42, 'حسب322', 'CS322', 'بنية وتنظيم الحاسب', 'Computer Architecture and Organization', 3, 2, 2, 3, 'dept_mandatory', 1),
(43, 'حسب342', 'CS342', 'نظم التشغيل', 'Operating Systems', 3, 2, 2, 3, 'dept_mandatory', 1),
(44, 'تقن331', 'IT331', 'الرسم بالحاسب', 'Computer Graphics', 3, 2, 2, 3, 'dept_mandatory', 1),
(45, 'تقن341', 'IT341', 'إشارات ونظم', 'Signals and Systems', 3, 2, 2, 3, 'dept_mandatory', 1),
(46, 'حسب411', 'CS411', 'الحوسبة المتوازية والموزعة', 'Parallel and Distributed Computing', 3, 2, 2, 4, 'dept_mandatory', 1),
(47, 'حسب413', 'CS413', 'التشفير', 'Cryptography', 3, 2, 2, 4, 'dept_mandatory', 1),
(48, 'تقن441', 'IT441', 'معالجة الصور', 'Image Processing', 3, 2, 2, 4, 'dept_mandatory', 1),
(49, 'حسب419', 'CS419', 'المترجمات', 'Compilers', 3, 2, 2, 4, 'dept_mandatory', 1),
(50, 'حسب462', 'CS462', 'تطبيقات الذكاء الاصطناعي', 'Artificial Intelligence Applications', 3, 2, 2, 4, 'dept_mandatory', 1),
(51, 'تقن444', 'IT444', 'الرؤية بالحاسب', 'Computer Vision', 3, 2, 2, 4, 'dept_mandatory', 1),
(52, 'حسب498', 'CS498', 'مشروع التخرج', 'Graduation Project', 6, 3, 3, 4, 'project', 1),
(53, 'حسب463', 'CS463', 'معالجة اللغات الطبيعية', 'Natural Language Processing', 3, 2, 2, 4, 'dept_elective', 1),
(54, 'حسب471', 'CS471', 'المعالجة على التوازي', 'Parallel Processing', 3, 2, 2, 4, 'dept_elective', 1),
(55, 'حسب318', 'CS318', 'المعالجات الدقيقة ولغة التجميع', 'Microprocessors and Assembly Language', 3, 2, 2, 3, 'dept_elective', 1),
(56, 'نال313', 'IS313', 'تخزين واسترجاع البيانات', 'Information Storage and Retrieval', 3, 2, 2, 3, 'dept_elective', 1),
(57, 'تقن433', 'IT433', 'الوسائط المتعددة', 'Multimedia', 3, 2, 2, 4, 'dept_elective', 1),
(58, 'نال352', 'IS352', 'تحليل وتصميم نظم المعلومات', 'Analysis and Design of Information Systems', 3, 2, 2, 3, 'dept_elective', 1),
(59, 'نال333', 'IS333', 'نظم المعلومات الإدارية', 'Management Information Systems', 3, 2, 2, 3, 'dept_elective', 1),
(60, 'تقن434', 'IT434', 'النظم المدمجة', 'Embedded Systems', 3, 2, 2, 4, 'dept_elective', 1),
(61, 'نال314', 'IS314', 'العرض المرئي للبيانات', 'Data Visualization', 3, 2, 2, 3, 'dept_elective', 1),
(62, 'نال318', 'IS318', 'علم البيانات', 'Data Science', 3, 2, 2, 3, 'dept_elective', 1),
(63, 'نال420', 'IS420', 'تأمين المعلومات', 'Information Security', 3, 2, 2, 4, 'dept_elective', 1),
(64, 'نال435', 'IS435', 'إدارة مراكز المعلومات', 'Information Centers Management', 3, 2, 2, 4, 'dept_elective', 1),
(65, 'تقن321', 'IT321', 'تكنولوجيا الاتصالات', 'Communication Technology', 3, 2, 2, 3, 'dept_elective', 1),
(66, 'نال451', 'IS451', 'نظم دعم اتخاذ القرار', 'Decision Support Systems', 3, 2, 2, 4, 'dept_elective', 1),
(67, 'تقن342', 'IT342', 'معالجة الإشارات الرقمية', 'Digital Signal Processing', 3, 2, 2, 3, 'dept_elective', 1),
(68, 'نال320', 'IS320', 'التنقيب في البيانات', 'Data Mining', 3, 2, 2, 3, 'dept_elective', 1),
(69, 'نال434', 'IS434', 'تحليل البيانات الكبيرة', 'Big Data Analytics', 3, 2, 2, 4, 'dept_elective', 1),
(70, 'تقن430', 'IT430', 'إنترنت الأشياء', 'Internet of Things', 3, 2, 2, 4, 'dept_elective', 1),
(71, 'حسب434', 'CS434', 'الحوسبة السحابية', 'Cloud Computing', 3, 2, 2, 4, 'dept_elective', 1),
(72, 'تقن442', 'IT442', 'التعرف على الأنماط', 'Pattern Recognition', 3, 2, 2, 4, 'dept_elective', 1),
(73, 'نال427', 'IS427', 'تطوير تطبيقات الهاتف المحمول', 'Mobile Applications Development', 3, 2, 2, 4, 'dept_elective', 1),
(74, 'نال322', 'IS322', 'نظم قواعد البيانات المتقدمة', 'Advanced Database Systems', 3, 2, 2, 3, 'dept_elective', 1),
(75, 'تقن412', 'IT412', 'نظم الزمن الحقيقي', 'Real Time Systems', 3, 2, 2, 4, 'dept_elective', 1),
(76, 'تقن431', 'IT431', 'الواقع الافتراضي والمعزز', 'Virtual and Augmented Reality', 3, 2, 2, 4, 'dept_elective', 1),
(77, 'تقن422', 'IT422', 'الشبكات اللاسلكية والمتحركة', 'Wireless and Mobile Networks', 3, 2, 2, 4, 'dept_elective', 1),
(78, 'نال422', 'IS422', 'مستودعات البيانات', 'Data Warehousing', 3, 2, 2, 4, 'dept_elective', 1),
(79, 'نال441', 'IS441', 'نظم المعلومات الذكية', 'Intelligent Information Systems', 3, 2, 2, 4, 'dept_elective', 1),
(80, 'نال316', 'IS316', 'قواعد البيانات الموزعة', 'Distributed Databases', 3, 2, 2, 4, 'dept_elective', 1),
(81, 'نال443', 'IS443', 'نظم المعلومات الجغرافية', 'Geographical Information Systems', 3, 2, 2, 4, 'dept_elective', 1),
(82, 'تقن443', 'IT443', 'معالجة الكلام', 'Speech Processing', 3, 2, 2, 4, 'dept_elective', 1),
(83, 'تقن322', 'IT322', 'شبكات الحاسبات المتقدمة', 'Advanced Computer Networks', 3, 2, 2, 3, 'dept_elective', 1),
(84, 'تقن324', 'IT324', 'برمجة الشبكات', 'Network Programming', 3, 2, 2, 4, 'dept_elective', 1),
(85, 'تقن323', 'IT323', 'تأمين شبكات الحاسب', 'Computer Network Security', 3, 2, 2, 3, 'dept_elective', 1),
(86, 'حسب395', 'CS395', 'اتجاهات حديثة في علوم الحاسب-1', 'New Trends in CS-1', 3, 2, 2, 3, 'dept_elective', 1),
(87, 'حسب396', 'CS396', 'اتجاهات حديثة في علوم الحاسب-2', 'New Trends in CS-2', 3, 2, 2, 3, 'dept_elective', 1),
(88, 'حسب495', 'CS495', 'اتجاهات حديثة في علوم الحاسب-3', 'New Trends in CS-3', 3, 2, 2, 4, 'dept_elective', 1),
(89, 'حسب496', 'CS496', 'اتجاهات حديثة في علوم الحاسب-4', 'New Trends in CS-4', 3, 2, 2, 4, 'dept_elective', 1),
(90, 'نال315', 'IS315', 'النمذجة والمحاكاة', 'Modelling and Simulation', 3, 2, 2, 3, 'dept_elective', 1),
(91, 'تقن313', 'IT313', 'واجهات الحاسبات', 'Computer Interfaces', 3, 2, 2, 3, 'dept_elective', 1),
(92, 'نال345', 'IS345', 'تطبيقات الإنترنت', 'Internet Applications', 3, 2, 2, 3, 'dept_elective', 1),
(93, 'حسب317', 'CS317', 'مفاهيم لغات الحاسب', 'Concepts of Programming Languages', 3, 2, 2, 3, 'dept_elective', 1),
(94, 'تقن311_IT', 'IT311_CS311', 'تعلم الآلة', 'Machine Learning', 3, 2, 2, 3, 'dept_mandatory', 2),
(95, 'تقن322_d', 'IT322_d', 'شبكات الحاسبات المتقدمة', 'Advanced Computer Networks', 3, 2, 2, 3, 'dept_mandatory', 2),
(96, 'تقن323_d', 'IT323_d', 'تأمين شبكات الحاسب', 'Computer Network Security', 3, 2, 2, 3, 'dept_mandatory', 2),
(97, 'تقن341_d', 'IT341_d', 'إشارات ونظم', 'Signals and Systems', 3, 2, 2, 3, 'dept_mandatory', 2),
(98, 'تقن331_d', 'IT331_d', 'الرسم بالحاسب', 'Computer Graphics', 3, 2, 2, 3, 'dept_mandatory', 2),
(99, 'تقن342_d', 'IT342_d', 'معالجة الإشارات الرقمية', 'Digital Signal Processing', 3, 2, 2, 3, 'dept_mandatory', 2),
(100, 'تقن324_d', 'IT324_d', 'برمجة الشبكات', 'Network Programming', 3, 2, 2, 4, 'dept_mandatory', 2),
(101, 'تقن441_d', 'IT441_d', 'معالجة الصور', 'Image Processing', 3, 2, 2, 4, 'dept_mandatory', 2),
(102, 'تقن444_d', 'IT444_d', 'الرؤية بالحاسب', 'Computer Vision', 3, 2, 2, 4, 'dept_mandatory', 2),
(103, 'نال427_d', 'IS427_d', 'تطوير تطبيقات الهاتف المحمول', 'Mobile Applications Development', 3, 2, 2, 4, 'dept_mandatory', 2),
(104, 'تقن430_d', 'IT430_d', 'إنترنت الأشياء', 'Internet of Things', 3, 2, 2, 4, 'dept_mandatory', 2),
(105, 'تقن422_d', 'IT422_d', 'الشبكات اللاسلكية والمتحركة', 'Wireless and Mobile Networks', 3, 2, 2, 4, 'dept_mandatory', 2),
(106, 'تقن434_d', 'IT434_d', 'النظم المدمجة', 'Embedded Systems', 3, 2, 2, 4, 'dept_mandatory', 2),
(107, 'تقن498', 'IT498', 'مشروع التخرج', 'Graduation Project', 6, 3, 3, 4, 'project', 2),
(108, 'نال322_d', 'IS322_d', 'نظم قواعد البيانات المتقدمة', 'Advanced Database Systems', 3, 2, 2, 3, 'dept_mandatory', 3),
(109, 'نال313_d', 'IS313_d', 'تخزين واسترجاع البيانات', 'Information Storage and Retrieval', 3, 2, 2, 3, 'dept_mandatory', 3),
(110, 'نال320_d', 'IS320_d', 'التنقيب في البيانات', 'Data Mining', 3, 2, 2, 3, 'dept_mandatory', 3),
(111, 'نال314_d', 'IS314_d', 'العرض المرئي للبيانات', 'Data Visualization', 3, 2, 2, 3, 'dept_mandatory', 3),
(112, 'حسب311_d', 'CS311_d', 'تعلم الآلة', 'Machine Learning', 3, 2, 2, 3, 'dept_mandatory', 3),
(113, 'نال316_d', 'IS316_d', 'قواعد البيانات الموزعة', 'Distributed Databases', 3, 2, 2, 4, 'dept_mandatory', 3),
(114, 'نال318_d', 'IS318_d', 'علم البيانات', 'Data Science', 3, 2, 2, 3, 'dept_mandatory', 3),
(115, 'نال441_d', 'IS441_d', 'نظم المعلومات الذكية', 'Intelligent Information Systems', 3, 2, 2, 4, 'dept_mandatory', 3),
(116, 'نال420_d', 'IS420_d', 'تأمين المعلومات', 'Information Security', 3, 2, 2, 4, 'dept_mandatory', 3),
(117, 'نال451_d', 'IS451_d', 'نظم دعم اتخاذ القرار', 'Decision Support Systems', 3, 2, 2, 4, 'dept_mandatory', 3),
(118, 'نال498', 'IS498', 'مشروع التخرج', 'Graduation Project', 6, 3, 3, 4, 'project', 3),
(119, 'تدر301', 'TR301', 'التدريب العملي الميداني', 'Practical Field Training', 0, 0, 3, 3, 'training', 1),
(120, 'تدر302', 'TR302', 'التدريب العملي الميداني', 'Practical Field Training', 0, 0, 3, 3, 'training', 2),
(121, 'تدر303', 'TR303', 'التدريب العملي الميداني', 'Practical Field Training', 0, 0, 3, 3, 'training', 3),
(122, 'أسس110', 'BS110', 'تأهيلي رياضيات (Math-0)', 'Mathematics Remedial (Math-0)', 0, 2, 0, 1, 'remedial', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `code` varchar(10) NOT NULL,
  `description_ar` text DEFAULT NULL,
  `description_en` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name_ar`, `name_en`, `code`, `description_ar`, `description_en`) VALUES
(1, 'علوم الحاسب', 'Computer Science', 'CS', 'بايايى', 'sdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd\nbfdnfdn\nssdvds\ndsfhsdbhdrnh\ndfhrnhtdhn\ndfbrbd'),
(2, 'تكنولوجيا المعلومات', 'Information Technology', 'IT', NULL, NULL),
(3, 'نظم المعلومات', 'Information Systems', 'IS', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `department_courses`
--

CREATE TABLE `department_courses` (
  `department_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `is_mandatory` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `department_courses`
--

INSERT INTO `department_courses` (`department_id`, `course_id`, `is_mandatory`) VALUES
(1, 1, 1),
(1, 2, 1),
(1, 3, 1),
(1, 4, 1),
(1, 5, 0),
(1, 6, 0),
(1, 7, 0),
(1, 8, 0),
(1, 9, 0),
(1, 10, 0),
(1, 11, 0),
(1, 12, 1),
(1, 13, 1),
(1, 14, 1),
(1, 15, 1),
(1, 16, 1),
(1, 17, 1),
(1, 18, 1),
(1, 19, 1),
(1, 20, 1),
(1, 21, 1),
(1, 22, 1),
(1, 23, 1),
(1, 24, 1),
(1, 25, 1),
(1, 26, 1),
(1, 27, 1),
(1, 28, 1),
(1, 29, 1),
(1, 30, 1),
(1, 31, 1),
(1, 32, 1),
(1, 33, 1),
(1, 34, 0),
(1, 35, 0),
(1, 36, 0),
(1, 37, 0),
(1, 38, 0),
(1, 39, 0),
(2, 1, 1),
(2, 2, 1),
(2, 3, 1),
(2, 4, 1),
(2, 5, 0),
(2, 6, 0),
(2, 7, 0),
(2, 8, 0),
(2, 9, 0),
(2, 10, 0),
(2, 11, 0),
(2, 12, 1),
(2, 13, 1),
(2, 14, 1),
(2, 15, 1),
(2, 16, 1),
(2, 17, 1),
(2, 18, 1),
(2, 19, 1),
(2, 20, 1),
(2, 21, 1),
(2, 22, 1),
(2, 23, 1),
(2, 24, 1),
(2, 25, 1),
(2, 26, 1),
(2, 27, 1),
(2, 28, 1),
(2, 29, 1),
(2, 30, 1),
(2, 31, 1),
(2, 32, 1),
(2, 33, 1),
(2, 34, 0),
(2, 35, 0),
(2, 36, 0),
(2, 37, 0),
(2, 38, 0),
(2, 39, 0),
(3, 1, 1),
(3, 2, 1),
(3, 3, 1),
(3, 4, 1),
(3, 5, 0),
(3, 6, 0),
(3, 7, 0),
(3, 8, 0),
(3, 9, 0),
(3, 10, 0),
(3, 11, 0),
(3, 12, 1),
(3, 13, 1),
(3, 14, 1),
(3, 15, 1),
(3, 16, 1),
(3, 17, 1),
(3, 18, 1),
(3, 19, 1),
(3, 20, 1),
(3, 21, 1),
(3, 22, 1),
(3, 23, 1),
(3, 24, 1),
(3, 25, 1),
(3, 26, 1),
(3, 27, 1),
(3, 28, 1),
(3, 29, 1),
(3, 30, 1),
(3, 31, 1),
(3, 32, 1),
(3, 33, 1),
(3, 34, 0),
(3, 35, 0),
(3, 36, 0),
(3, 37, 0),
(3, 38, 0),
(3, 39, 0);

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `grade` decimal(5,2) DEFAULT NULL,
  `grade_points` decimal(4,2) DEFAULT NULL,
  `grade_symbol` varchar(5) DEFAULT NULL,
  `status` enum('registered','withdrawn','completed','incomplete','continuing') DEFAULT 'registered',
  `is_repeat` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'general',
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `published_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `title`, `description`, `image_url`, `category`, `is_published`, `published_at`, `created_at`, `updated_at`) VALUES
(1, 'Welcome to FCI Arish', 'Official student portal launched.', NULL, 'general', 1, '2026-02-24', NULL, NULL),
(2, 'El3alami', 'rrrrrrrrrrrrr', 'http://localhost:8000/storage/news/EnoFJlXEc6EpHjNJHm70xVTJp4p0EtqfpDZkamxa.png', 'academic', 1, '2026-02-24', '2026-02-24 05:25:56', '2026-02-24 05:33:04'),
(3, 'kkkk', NULL, NULL, 'general', 1, '2026-02-24', '2026-02-24 05:34:04', '2026-02-24 05:34:04'),
(4, 'ewwwwwg', NULL, NULL, 'general', 1, '2026-02-24', '2026-02-24 05:34:08', '2026-02-24 05:34:08'),
(5, 'ssssrdb', NULL, NULL, 'general', 1, '2026-02-24', '2026-02-24 05:34:49', '2026-02-24 05:34:49'),
(6, 'dzbbbbbbbb', NULL, NULL, 'general', 1, '2026-02-24', '2026-02-24 05:34:54', '2026-02-24 05:34:54');

-- --------------------------------------------------------

--
-- Table structure for table `prerequisites`
--

CREATE TABLE `prerequisites` (
  `course_id` int(11) NOT NULL,
  `prereq_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `prerequisites`
--

INSERT INTO `prerequisites` (`course_id`, `prereq_id`) VALUES
(13, 12),
(15, 13),
(19, 18),
(21, 18),
(22, 19),
(23, 19),
(24, 17),
(25, 19),
(26, 19),
(27, 19),
(28, 13),
(29, 28),
(30, 19),
(33, 19),
(34, 14),
(38, 26),
(40, 21),
(42, 24),
(43, 25),
(44, 19),
(45, 13),
(46, 22),
(47, 20),
(48, 23),
(49, 22),
(50, 27),
(51, 40),
(53, 27),
(54, 42),
(55, 24),
(56, 30),
(57, 19),
(58, 32),
(59, 31),
(60, 22),
(61, 22),
(62, 14),
(63, 30),
(64, 31),
(65, 28),
(66, 31),
(67, 45),
(68, 30),
(69, 30),
(70, 29),
(71, 29),
(72, 40),
(73, 21),
(74, 30),
(75, 42),
(76, 44),
(77, 29),
(78, 30),
(79, 27),
(80, 74),
(81, 74),
(82, 45),
(83, 29),
(84, 83),
(85, 29),
(90, 23),
(91, 25),
(92, 33),
(93, 19);

-- --------------------------------------------------------

--
-- Table structure for table `professors`
--

CREATE TABLE `professors` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(150) NOT NULL,
  `name_en` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `title` enum('lecturer','assistant_prof','associate_prof','prof') DEFAULT 'lecturer',
  `specialization` varchar(200) DEFAULT NULL,
  `status` enum('active','on_leave','retired') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `professors`
--

INSERT INTO `professors` (`id`, `name_ar`, `name_en`, `email`, `department_id`, `title`, `specialization`, `status`, `created_at`) VALUES
(1, 'ثثثثثثثث', 'eeeeeee', 'ddddddddd@dgsges.fgg', 2, 'assistant_prof', 'aaCACacC', 'active', '2026-02-24 05:03:16');

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `term` enum('fall','spring','summer') NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `reg_start` date DEFAULT NULL,
  `reg_end` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `student_number` varchar(20) NOT NULL,
  `national_id` varchar(14) NOT NULL,
  `name_ar` varchar(150) NOT NULL,
  `name_en` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT 1,
  `cgpa` decimal(5,3) DEFAULT 0.000,
  `total_passed_hrs` int(11) DEFAULT 0,
  `is_first_term` tinyint(1) DEFAULT 1,
  `academic_warnings` int(11) DEFAULT 0,
  `status` enum('active','suspended','dismissed','graduated') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `student_number`, `national_id`, `name_ar`, `name_en`, `email`, `department_id`, `level`, `cgpa`, `total_passed_hrs`, `is_first_term`, `academic_warnings`, `status`, `created_at`) VALUES
(3, '1', '14785236915987', 'غغغ', 'sffefe', NULL, 1, 2, 0.000, 0, 1, 0, 'active', '2026-02-24 04:21:14'),
(5, '9', '44444444376867', 'شششش', 'aqaqai', 'abdulrahmanomer872@gmail.com', 2, 1, 0.000, 0, 1, 0, 'active', '2026-02-24 04:40:25');

-- --------------------------------------------------------

--
-- Stand-in structure for view `student_passed_courses`
-- (See below for the actual view)
--
CREATE TABLE `student_passed_courses` (
`student_id` int(11)
,`course_id` int(11)
,`code_en` varchar(20)
,`name_ar` varchar(200)
,`credit_hours` int(11)
,`grade` decimal(5,2)
,`grade_points` decimal(4,2)
,`grade_symbol` varchar(5)
);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','professor','student') NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `professor_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `student_id`, `professor_id`, `is_active`, `last_login`, `created_at`) VALUES
(4, 'admin', '$2y$12$jyPnVt8FoJ5MvpB7sQKtPe77fcsGOHZY3kcvyqxpB0OMphyYvfFta', 'admin', NULL, NULL, 1, '2026-02-24 05:34:43', '2026-02-23 23:09:40'),
(5, 'professor', '$2y$12$D6wm.UhiJRAUKQROq9pek.t2i9d7YTqWUZ1rO7iRULmIrTjSAvk9.', 'professor', NULL, NULL, 1, '2026-02-23 23:21:04', '2026-02-23 23:09:40'),
(6, 'student', '$2y$12$QPu6e8YtAwFqWfTdmKDsYeZuKKpPPU2oOucDTLnJvsBwepYWTDRiK', 'student', NULL, NULL, 1, NULL, '2026-02-23 23:09:40'),
(7, '1', '$2y$12$ceRcmKQI8F17CXG195o8X..h8E9rw12PYnFVElooBoKFaUssUQwNa', 'student', 3, NULL, 1, NULL, '2026-02-24 04:21:14'),
(9, 'wwww', '$2y$12$BZ67YX77zS7q52m10x8CU.8zE7IQG/RlAlwjfI8gOGg0HdJhRvhUS', 'student', 5, NULL, 1, NULL, '2026-02-24 04:40:26'),
(10, 'testprofessor@example.com', '$2y$12$mcHYBdSsYHndsR1VsuJBUOx2a9oSg3Fo5CpIqFlsVplzEH1sQIGJq', 'professor', NULL, 1, 1, '2026-02-24 03:05:01', '2026-02-24 05:03:16');

-- --------------------------------------------------------

--
-- Structure for view `student_passed_courses`
--
DROP TABLE IF EXISTS `student_passed_courses`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `student_passed_courses`  AS SELECT `e`.`student_id` AS `student_id`, `e`.`course_id` AS `course_id`, `c`.`code_en` AS `code_en`, `c`.`name_ar` AS `name_ar`, `c`.`credit_hours` AS `credit_hours`, `e`.`grade` AS `grade`, `e`.`grade_points` AS `grade_points`, `e`.`grade_symbol` AS `grade_symbol` FROM (`enrollments` `e` join `courses` `c` on(`e`.`course_id` = `c`.`id`)) WHERE `e`.`grade_symbol` not in ('F','W','Abs','FD') AND `e`.`status` = 'completed' AND `e`.`grade` >= 60 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cgpa_credit_rules`
--
ALTER TABLE `cgpa_credit_rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `department_courses`
--
ALTER TABLE `department_courses`
  ADD PRIMARY KEY (`department_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`course_id`,`semester_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `prerequisites`
--
ALTER TABLE `prerequisites`
  ADD PRIMARY KEY (`course_id`,`prereq_id`),
  ADD KEY `prereq_id` (`prereq_id`);

--
-- Indexes for table `professors`
--
ALTER TABLE `professors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `year` (`year`,`term`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_number` (`student_number`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `professor_id` (`professor_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cgpa_credit_rules`
--
ALTER TABLE `cgpa_credit_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `professors`
--
ALTER TABLE `professors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `department_courses`
--
ALTER TABLE `department_courses`
  ADD CONSTRAINT `department_courses_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `department_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `enrollments_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`);

--
-- Constraints for table `prerequisites`
--
ALTER TABLE `prerequisites`
  ADD CONSTRAINT `prerequisites_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `prerequisites_ibfk_2` FOREIGN KEY (`prereq_id`) REFERENCES `courses` (`id`);

--
-- Constraints for table `professors`
--
ALTER TABLE `professors`
  ADD CONSTRAINT `professors_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `professors` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
