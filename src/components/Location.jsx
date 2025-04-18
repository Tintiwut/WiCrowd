// components/Location.js
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

  switch (selectedLocation) {
    case "Building A3":
      return <LocationA3 language={language} />;
    case "Building A6":
      return <LocationA6 language={language} />;
    case "Building B4":
      return <LocationB4 language={language} />;
    default:
      return <p>Invalid location</p>;
  }
};

export default Location;
