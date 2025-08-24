import "./App.css";
import { Home } from "./Components/Home/Home";
import { useState, useEffect } from "react";
import { Namevalue, Jobvalue, Idvalue } from "./Components/Contextdata";

import "bootstrap/dist/css/bootstrap.min.css";

const images = [
  "https://mag-sa.com/wp-content/uploads/2024/05/Rectangle-5-2.png",
  "https://mag-sa.com/wp-content/uploads/2024/06/Rectangle-5-3.jpg",
];

function App() {
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [idValue, setIdValue] = useState(""); // خلي الاسم متطابق مع Firestore

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 10000); // كل 10 ثواني

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundImage: `url(${images[currentImage]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        transition: "background-image 1s ease-in-out",
        color: "white",
      }}
    >
      <Namevalue.Provider value={{ name, setName }}>
        <Jobvalue.Provider value={{ job, setJob }}>
          <Idvalue.Provider value={{ idValue, setIdValue }}>
            <div className="App">
              <Home />
            </div>
          </Idvalue.Provider>
        </Jobvalue.Provider>
      </Namevalue.Provider>
    </div>
  );
}

export default App;
