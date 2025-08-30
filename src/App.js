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
  const [idValue, setIdValue] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${images[currentImage]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      />
      <Namevalue.Provider value={{ name, setName }}>
        <Jobvalue.Provider value={{ job, setJob }}>
          <Idvalue.Provider value={{ idValue, setIdValue }}>
            <div className="App text-white">
              <Home />
            </div>
          </Idvalue.Provider>
        </Jobvalue.Provider>
      </Namevalue.Provider>
    </>
  );
}

export default App;
