/*
  Header above the app for pipeline and model selection
*/
import React from "react";
import "./style.css";

export default function Header(props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <h3
        style={{
          color: "#ffffff",
          alignSelf: "center",
          marginRight: "1em",
          marginLeft: "1em",
        }}
      >
        Stronk AI
      </h3>
      <div
        className={
          props.pipeline == "CREATE"
            ? "dropdown-item border"
            : "dropdown-item"
        }
        onClick={() => {
          props.setPipeline("CREATE");
        }}
      >
        CREATE
      </div>
      <div
        className={
          props.pipeline == "ENHANCE"
            ? "dropdown-item border"
            : "dropdown-item"
        }
        onClick={() => {
          props.setPipeline("ENHANCE");
        }}
      >
        ENHANCE
      </div>
      <div
        className={
          props.pipeline == "ANIMATE"
            ? "dropdown-item border"
            : "dropdown-item"
        }
        onClick={() => {
          props.setPipeline("ANIMATE");
        }}
      >
        ANIMATE
      </div>
    </div>
  );
}
