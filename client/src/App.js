import React, { Component } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home"; //< See this page for all the good stuff
import NotFound from "./pages/NotFound";

import './style.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
