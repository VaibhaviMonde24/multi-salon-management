import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SalonDetails() {
  const { salon_id } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalonData();
  }, [salon_id]);

  const loadSalonData = async () => {
    try {
      const salonRes = await fetch(
        `${API_URL}/api/salons/public/${salon_id}`
      );
      const salonData = await salonRes.json();

      if (salonData.success) {
        setSalon(salonData.data);
      }

      const servicesRes = await fetch(
        `${API_URL}/api/salons/${salon_id}/services`
      );
      const servicesData = await servicesRes.json();

      if (servicesData.success) {
        setServices(servicesData.data);
      }

      const staffRes = await fetch(
        `${API_URL}/api/staff/salon/${salon_id}`
      );
      const staffData = await staffRes.json();

      if (staffData.success) {
        setStaff(staffData.data);
      }
    } catch (err) {
      console.error("Error loading salon details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h3>Loading salon details...</h3>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="container mt-5 text-center">
        <h3>Salon not found</h3>
      </div>
    );
  }

  return (
    <div className="container py-5">

      {/* Salon Header */}
      <div className="card shadow border-0 mb-4">
        <div className="card-body">

          <h1 className="mb-3">{salon.salon_name}</h1>

          <p>
            <strong>📍 Address:</strong>{" "}
            {salon.salon_address}
          </p>

          <p>
            <strong>🏙 City:</strong>{" "}
            {salon.city}
          </p>

          <p>
            <strong>📞 Phone:</strong>{" "}
            {salon.salon_phone_number}
          </p>

          <p>
            <strong>📧 Email:</strong>{" "}
            {salon.salon_email || "Not Available"}
          </p>

          <p>
            <strong>💇 Category:</strong>{" "}
            {salon.category || "General"}
          </p>

          <hr />

          <h5>About Salon</h5>

          <p>
            {salon.salon_description ||
              "No description available."}
          </p>

          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(
                `/customer/book-appointment?salon_id=${salon.salon_id}`
              )
            }
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* Services */}
      <div className="card shadow border-0 mb-4">
        <div className="card-body">

          <h3 className="mb-3">Services</h3>

          {services.length === 0 ? (
            <p>No services available.</p>
          ) : (
            <div className="row">
              {services.map((service) => (
                <div
                  key={service.service_id}
                  className="col-md-4 mb-3"
                >
                  <div className="border rounded p-3 h-100">

                    <h5>{service.service_name}</h5>

                    <p>
                      Price: ₹{service.service_price}
                    </p>

                    <p>
                      Duration: {service.service_duration} mins
                    </p>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Staff */}
      <div className="card shadow border-0">
        <div className="card-body">

          <h3 className="mb-3">Staff Members</h3>

          {staff.length === 0 ? (
            <p>No staff available.</p>
          ) : (
            <div className="row">
              {staff.map((member) => (
                <div
                  key={member.staff_id}
                  className="col-md-4 mb-3"
                >
                  <div className="border rounded p-3 h-100">

                    <h5>{member.name}</h5>

                    <p>
                      Role: {member.staff_role}
                    </p>

                    <p>
                      Status: {member.staff_status}
                    </p>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default SalonDetails;