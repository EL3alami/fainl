import { useState } from "react";
import "./AdminPages.css";

export default function Settings() {
  const [settings, setSettings] = useState({
    universityName: "Faculty of Computers & Information – Arish University",
    shortName: "FCI Arish",
    logo: "",
    email: "info@fci-arish.edu.eg",
    phone: "+20 100 000 0000",
    address: "Arish, North Sinai, Egypt",
    facebook: "",
    twitter: "",
    linkedin: "",
    websiteStatus: "online",
    allowRegistration: true,
  });

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Backend Ready
    // axios.put("/api/settings", settings);

    alert("Settings saved successfully ✔️");
  };

  return (
    <div className="admin-page">
      <h1>Website Settings</h1>

      <form onSubmit={handleSave}>
        {/* ===== General Info ===== */}
        <h3>General Information</h3>
        <table className="admin-table">
          <tbody>
            <tr>
              <th>University Name</th>
              <td>
                <input
                  value={settings.universityName}
                  onChange={(e) =>
                    handleChange("universityName", e.target.value)
                  }
                />
              </td>
            </tr>

            <tr>
              <th>Short Name</th>
              <td>
                <input
                  value={settings.shortName}
                  onChange={(e) =>
                    handleChange("shortName", e.target.value)
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===== Branding ===== */}
        <h3>Branding</h3>
        <table className="admin-table">
          <tbody>
            <tr>
              <th>University Logo</th>
              <td>
                <input
                  type="file"
                  onChange={(e) =>
                    handleChange("logo", e.target.files[0])
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===== Contact Info ===== */}
        <h3>Contact Information</h3>
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Email</th>
              <td>
                <input
                  value={settings.email}
                  onChange={(e) =>
                    handleChange("email", e.target.value)
                  }
                />
              </td>
            </tr>

            <tr>
              <th>Phone</th>
              <td>
                <input
                  value={settings.phone}
                  onChange={(e) =>
                    handleChange("phone", e.target.value)
                  }
                />
              </td>
            </tr>

            <tr>
              <th>Address</th>
              <td>
                <input
                  value={settings.address}
                  onChange={(e) =>
                    handleChange("address", e.target.value)
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===== Social Media ===== */}
        <h3>Social Media</h3>
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Facebook</th>
              <td>
                <input
                  value={settings.facebook}
                  onChange={(e) =>
                    handleChange("facebook", e.target.value)
                  }
                />
              </td>
            </tr>

            <tr>
              <th>Twitter</th>
              <td>
                <input
                  value={settings.twitter}
                  onChange={(e) =>
                    handleChange("twitter", e.target.value)
                  }
                />
              </td>
            </tr>

            <tr>
              <th>LinkedIn</th>
              <td>
                <input
                  value={settings.linkedin}
                  onChange={(e) =>
                    handleChange("linkedin", e.target.value)
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===== System Settings ===== */}
        <h3>System Settings</h3>
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Website Status</th>
              <td>
                <select
                  value={settings.websiteStatus}
                  onChange={(e) =>
                    handleChange("websiteStatus", e.target.value)
                  }
                >
                  <option value="online">Online</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </td>
            </tr>

            <tr>
              <th>Allow Student Registration</th>
              <td>
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) =>
                    handleChange("allowRegistration", e.target.checked)
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>

        <br />

        <button className="btn-add">Save All Settings</button>
      </form>
    </div>
  );
}
