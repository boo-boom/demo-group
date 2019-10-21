import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./style.scss";

class Home extends Component {
  render() {
    return (
      <div className="page-home">
        <Link to="calculation">解决js浮点数运算</Link>
      </div>
    )
  }
}

export default Home;
