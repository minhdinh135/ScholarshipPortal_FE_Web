import { useNavigate } from "react-router-dom";
import AboutUsImage from "../../../assets/AboutUs.png";
import { FaGraduationCap, FaHandsHelping } from "react-icons/fa";
import RouteNames from "@/constants/routeNames";

const AboutUs = () => {
  const navigate = useNavigate();
  const handleApplyNowClick = () => {
    navigate(RouteNames.SCHOLARSHIP_PROGRAM);
  };
  return (
    <div
      style={{
        textAlign: "center",
        // padding: "50px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff",
      }}
    >
      <img
        src={AboutUsImage}
        alt="About Us"
        style={{
          width: "100%",
          maxHeight: "450px",
          objectFit: "cover",
          boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.3s ease",
          marginBottom: "30px",
        }}
      />

      <h1
        style={{
          fontSize: "38px",
          color: "#2C3E50",
          fontWeight: "700",
          marginBottom: "20px",
          marginTop: "50px",
        }}
      >
        Welcome to SSAP!
      </h1>
      <br></br>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
          gap: "50px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <FaGraduationCap size={60} color="#FF6F20" />
          <h3 style={{ color: "#FF6F20", fontSize: "22px", fontWeight: "600" }}>
            Empowering Students
          </h3>
        </div>
        <div style={{ textAlign: "center" }}>
          <FaHandsHelping size={60} color="#007BFF" className="ml-35" />
          <h3 style={{ color: "#007BFF", fontSize: "22px", fontWeight: "600" }}>
            Supporting Dreams
          </h3>
        </div>
      </div>

      <div
        style={{
          fontSize: "20px",
          lineHeight: "1.8",
          color: "#555",
          margin: "40px auto",
          maxWidth: "900px",
          padding: "30px 40px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
          textAlign: "left",
          fontStyle: "italic",
          position: "relative",
        }}
      >
        <p style={{ marginBottom: "20px" }}>
          At the Scholarship Search and Application Portal (SSAP), we believe
          that every student deserves the opportunity to pursue their academic
          dreams. Our mission is to simplify the scholarship search and
          application process, making it accessible and efficient for students
          worldwide.
        </p>

        <p style={{ marginBottom: "20px" }}>
          With our user-friendly platform, students can easily find scholarships
          tailored to their needs, apply confidently, and track their
          application status. We also provide scholarship providers with robust
          tools to manage applications and allocate funds effectively, ensuring
          that deserving students receive the support they need.
        </p>

        <p style={{ fontWeight: "bold" }}>
          Explore our platform today and take the first step towards achieving
          your academic goals. Together, we can make a difference in the lives
          of students everywhere!
        </p>

        {/* Background Decoration */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: "60px",
            height: "60px",
            backgroundColor: "#FF6F20",
            borderRadius: "50%",
            opacity: 0.2,
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            backgroundColor: "#007BFF",
            borderRadius: "50%",
            opacity: 0.2,
          }}
        ></div>
      </div>
    </div>
  );
};

export default AboutUs;
