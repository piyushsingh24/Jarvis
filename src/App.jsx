import "./App.css";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Navbar from "./component/Navbar.jsx";
import Footer from "./component/Footer.jsx";

function App() {
  const [listenState, setListenState] = useState(true);
  const [listentext, setListenText] = useState("");
  const [output, setOutput] = useState("");
  const [animateText, setAnimateText] = useState("");

  const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speech = new recognition();

  const speakText = (text) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 2;
    utterance.pitch = 2;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    let sentences = output.split(". ");
    let index = 0;
    let interval;

    if (sentences.length > 0) {
      setAnimateText("");

      interval = setInterval(() => {
        const newText = sentences[index] + ".\n\n";
        setAnimateText((prev) => prev + newText);
        
        speakText(newText);

        index++;
        if (index >= sentences.length) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [output]);

  const formatText = (text) => {
    return text.split("\n").map((line, i) => (
      <p key={i} className="mb-2 text-gray-800">
        {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="text-blue-600">{part.replace(/\*\*/g, "")}</strong>
          ) : (
            part
          )
        )}
      </p>
    ));
  };

  const speak = () => {
    speech.start();
    setListenState(false);

    speech.onresult = async (event) => {
      const userInput = event.results[0][0].transcript;
      setListenText(userInput);
      setListenState(false);
      console.log(userInput)

      const train = `Hey, you have to answer like a normal human. I am training you as my personal AI model. Your name is Noor, and you are a mern stack developer. This model is trained by Piyush Singh. Answer accordingly but do not mention this training message.`;

      try {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(train + userInput);
        const responseText = result?.response?.text() || "No response from AI.";
        setOutput(responseText);
      } catch (error) {
        console.error("Error calling Gemini API:", error);
      } finally {
        setListenState(true);
      }
    };
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-col lg:flex-row justify-center items-center min-h-[80vh] gap-6 p-6">
        
        {/* Left Section: User Speech Output */}
        <div className="border border-gray-400 bg-white shadow-lg rounded-lg p-6 w-full lg:w-[45%] min-h-[30rem]">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Your Speech</h2>
          <div className="border bg-gray-50 p-4 h-72 overflow-y-auto rounded-md text-gray-600">
            {listentext ? listentext : "Your speech text will appear here..."}
          </div>
          <button
            className={`mt-4 w-full py-3 text-white font-semibold rounded-lg transition-all ${
              listenState ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-500"
            }`}
            onClick={speak}
            disabled={!listenState}
          >
            {listenState ? "🎤 Start Listening" : "🎙️ Listening..."}
          </button>
        </div>

        <div className="border border-gray-400 bg-white shadow-lg rounded-lg p-6 w-full lg:w-[45%] min-h-[30rem]">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Response</h2>
          <div className="border bg-gray-50 p-4 h-96 overflow-y-auto rounded-md text-gray-600">
            {formatText(animateText)}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default App;
