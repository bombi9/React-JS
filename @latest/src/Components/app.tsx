import { useState } from "react";
import Method from "../Components/Method";
import Form from "./Form.tsx";

function App() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleSelect = (method: string) => {
    setSelectedMethod(method);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Decision Support System (AHP & ELECTRE)</h1>
      </header>

      <div className="method-selector">
        <Method MethodName="AHP" onSelect={handleSelect} />
        <Method MethodName="ELECTRE" onSelect={handleSelect} />
      </div>

      <main className="app-main">
        {selectedMethod ? (
          <Form
            myCriteria={selectedMethod}
            Field1={selectedMethod === "AHP" ? "Option" : "Alternative"}
            Field2="Criterion"
          />
        ) : (
          <p className="placeholder">Choose a method above to start</p>
        )}
      </main>
    </div>
  );
}

export default App;
