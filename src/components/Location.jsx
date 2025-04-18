import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LocationA3 from "./LocationA3";
import LocationA6 from "./LocationA6";
import LocationB4 from "./LocationB4";

const Location = ({ language }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const selectedLocation = state?.location;

  if (!selectedLocation) {
    navigate("/");
    return null;
  }

  // ✅ สร้าง style สำหรับรองรับ touch gesture
  const touchWrapperStyle = {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch", // for iOS
    touchAction: "pan-x",
  };

  switch (selectedLocation) {
    case "Building A3":
      return (
        <div style={touchWrapperStyle}>
          <LocationA3 language={language} />
        </div>
      );
    case "Building A6":
      return (
        <div style={touchWrapperStyle}>
          <LocationA6 language={language} />
        </div>
      );
    case "Building B4":
      return (
        <div style={touchWrapperStyle}>
          <LocationB4 language={language} />
        </div>
      );
    default:
      return <p>Invalid location</p>;
  }
};

export default Location;