import { useEffect, useState } from "react";
import "../Styles/Form.css";
import {
  computeAHPFull,
  computeELECTRERanking,
  type AHPFullResponse,
  type ELECTRERankingResponse,
} from "../services/apiService";
interface Props {
  Field1: string;
  Field2: string;
  myCriteria: string;
}

function Form({ myCriteria, Field1, Field2 }: Props) {
  return <Ell myCriteria={myCriteria} Field1={Field1} Field2={Field2} />;
}
function Ell({ myCriteria, Field1, Field2 }: Props) {
  const isAHP = myCriteria === "AHP";
  const isELECTRE = myCriteria === "ELECTRE";
  const requiresOptions = isAHP || isELECTRE;

  const [optionCount, setOptionCount] = useState<number>(0);
  const [criteriaCount, setCriteriaCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ahpResult, setAHPResult] = useState<AHPFullResponse["result"] | null>(null);
  const [electreResult, setELECTREResult] = useState<ELECTRERankingResponse | null>(null);

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">You Chose: {myCriteria}</h1>
      </div>

      <div className="form-inputs">
        {requiresOptions && (
          <div className="input-group">
            <label htmlFor={`${Field1}-input`}>Number of {Field1}s</label>
            <input
              id={`${Field1}-input`}
              type="number"
              min="2"
              max="10"
              value={optionCount || ""}
              onChange={(e) => setOptionCount(Number(e.target.value))}
              placeholder="0"
              className="form-input"
            />
          </div>
        )}

        <div className="input-group">
          <label htmlFor={`${Field2}-input`}>Number of {Field2}s</label>
          <input
            id={`${Field2}-input`}
            type="number"
            min="2"
            max="10"
            value={criteriaCount || ""}
            onChange={(e) => setCriteriaCount(Number(e.target.value))}
            placeholder="0"
            className="form-input"
          />
        </div>
      </div>

      {isAHP && criteriaCount > 0 && optionCount > 0 && (
        <AHPFullTable
          criteriaCount={criteriaCount}
          altCount={optionCount}
          Field1={Field1}
          Field2={Field2}
          onCompute={(res) => {
            setAHPResult(res);
            setError(null);
          }}
          onError={setError}
          loading={loading}
          setLoading={setLoading}
        />
      )}

      {isELECTRE && criteriaCount > 0 && optionCount > 0 && (
        <ELECTRETable
          criteriaCount={criteriaCount}
          optionCount={optionCount}
          Field1={Field1}
          Field2={Field2}
          onCompute={(res) => {
            setELECTREResult(res);
            setError(null);
          }}
          onError={setError}
          loading={loading}
          setLoading={setLoading}
        />
      )}

      {error && (
        <div className="result-container error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {ahpResult && (
        <div className="result-container">
          <h3>AHP Results</h3>
          <div className="result-content">
            <p>
              <strong>Criteria Weights:</strong>{" "}
              {ahpResult.criteria_weights
                .map((w: number, i: number) => `${Field2} ${i + 1}: ${w.toFixed(4)}`)
                .join(", ")}
            </p>
            <p>
              <strong>Global Scores:</strong>{" "}
              {ahpResult.global_scores
                .map((v: number, i: number) => `${Field1} ${i + 1}: ${v.toFixed(4)}`)
                .join(", ")}
            </p>
            <p>
              <strong>Best Alternative:</strong>{" "}
              {Field1} {ahpResult.best_alternative + 1}
            </p>
          </div>
        </div>
      )}

      {electreResult && (
        <div className="result-container">
          <h3>ELECTRE Results</h3>
          <div className="result-content">
            <p><strong>Ranking:</strong> {electreResult.result.ranking.join(", ")}</p>
            <p><strong>Net Flows:</strong> {electreResult.result.net_flows.map((nf, i) => `${Field1} ${i + 1}: ${nf.toFixed(4)}`).join(", ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface AHPFullTableProps {
  criteriaCount: number;
  altCount: number;
  Field1: string;
  Field2: string;
  onCompute: (res: AHPFullResponse["result"]) => void;
  onError: (err: string | null) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

function AHPFullTable({
  criteriaCount,
  altCount,
  Field1,
  Field2,
  onCompute,
  onError,
  loading,
  setLoading,
}: AHPFullTableProps) {
  const [criteriaMatrix, setCriteriaMatrix] = useState<{ [key: string]: string }>({});
  const [altMatrices, setAltMatrices] = useState<{ [k: number]: { [key: string]: string } }>({});
  const [activeCriterion, setActiveCriterion] = useState(0);

  useEffect(() => {
    setActiveCriterion((prev) => (prev < criteriaCount ? prev : 0));
  }, [criteriaCount]);

  const handleCriteriaChange = (i: number, j: number, val: string) => {
    if (i >= j) return;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return;
    setCriteriaMatrix((prev) => ({
      ...prev,
      [`${i}-${j}`]: val,
      [`${j}-${i}`]: (1 / num).toFixed(4),
    }));
  };

  const handleAltChange = (c: number, i: number, j: number, val: string) => {
    if (i >= j) return;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return;
    setAltMatrices((prev) => ({
      ...prev,
      [c]: {
        ...(prev[c] || {}),
        [`${i}-${j}`]: val,
        [`${j}-${i}`]: (1 / num).toFixed(4),
      },
    }));
  };

  const buildMatrix = (source: { [key: string]: string }, size: number): number[][] => {
    const mat: number[][] = [];
    for (let i = 0; i < size; i++) {
      mat[i] = [];
      for (let j = 0; j < size; j++) {
        if (i === j) mat[i][j] = 1;
        else mat[i][j] = parseFloat(source[`${i}-${j}`]) || 0;
      }
    }
    return mat;
  };

  const handleCompute = async () => {
    try {
      setLoading(true);
      onError(null);

      const criteriaMat = buildMatrix(criteriaMatrix, criteriaCount);
      const altMats = [];
      for (let c = 0; c < criteriaCount; c++) {
        altMats.push(buildMatrix(altMatrices[c] || {}, altCount));
      }

      const payload = { criteria_matrix: criteriaMat, alt_matrices: altMats };
      const res = await computeAHPFull(payload);
      onCompute(res.result);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error computing AHP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ahp-container">
      <h3>1️⃣ Compare {Field2}s</h3>
      <div className="table-container">
        <table className="decision-table GG">
          <thead>
            <tr>
              <th>{Field2}/{Field2}</th>
              {Array.from({ length: criteriaCount }, (_, i) => (
                <th key={i}>{Field2} {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: criteriaCount }, (_, i) => (
              <tr key={i}>
                <td>{Field2} {i + 1}</td>
                {Array.from({ length: criteriaCount }, (_, j) => (
                  <td key={j}>
                    <input
                      type="number"
                      step="any"
                      value={criteriaMatrix[`${i}-${j}`] || (i === j ? "1" : "")}
                      onChange={(e) => handleCriteriaChange(i, j, e.target.value)}
                      disabled={i === j}
                      readOnly={i > j}
                      className="table-input"
                      placeholder={i === j ? "1" : i < j ? "Enter value" : "Auto"}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="alt-table-wrapper">
        <div className="alt-table-selector">
          <label htmlFor="alt-criterion-selector">Criterion focus</label>
          <select
            id="alt-criterion-selector"
            value={activeCriterion}
            onChange={(e) => setActiveCriterion(Number(e.target.value))}
          >
            {Array.from({ length: criteriaCount }, (_, idx) => (
              <option key={idx} value={idx}>
                {Field2} {idx + 1}
              </option>
            ))}
          </select>
        </div>
        <h3>2️⃣ Compare {Field1}s for {Field2} {activeCriterion + 1}</h3>
        <div className="table-container">
          <table className="decision-table GG">
            <thead>
              <tr>
                <th>{Field1}/{Field1}</th>
                {Array.from({ length: altCount }, (_, i) => (
                  <th key={i}>{Field1} {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: altCount }, (_, i) => (
                <tr key={i}>
                  <td>{Field1} {i + 1}</td>
                  {Array.from({ length: altCount }, (_, j) => (
                    <td key={j}>
                      <input
                        type="number"
                        step="any"
                        value={altMatrices[activeCriterion]?.[`${i}-${j}`] || (i === j ? "1" : "")}
                        onChange={(e) => handleAltChange(activeCriterion, i, j, e.target.value)}
                        disabled={i === j}
                        readOnly={i > j}
                        className="table-input"
                        placeholder={i === j ? "1" : i < j ? "Enter value" : "Auto"}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={handleCompute} disabled={loading} className="submit-button">
        {loading ? "Computing..." : "Compute Final AHP Ranking"}
      </button>
    </div>
  );
}

interface ELECTRETableProps {
  criteriaCount: number;
  optionCount: number;
  Field2: string;
  Field1: string;
  onCompute: (result: ELECTRERankingResponse) => void;
  onError: (error: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

function ELECTRETable({
  criteriaCount,
  optionCount,
  Field2,
  Field1,
  onCompute,
  onError,
  loading,
  setLoading,
}: ELECTRETableProps) {
  const [cellValues, setCellValues] = useState<{ [key: string]: string }>({});
  const [weights, setWeights] = useState<{ [key: string]: string }>({});

  const handleSubmit = async () => {
    try {
      setLoading(true);
      onError(null);

      const weightsArray = Array.from({ length: criteriaCount }, (_, i) =>
        parseFloat(weights[`w${i}`] || "0")
      );
      const sum = weightsArray.reduce((a, b) => a + b, 0);
      const normalized = weightsArray.map((w) => w / sum);

      const performanceMatrix = Array.from({ length: optionCount }, (_, i) =>
        Array.from({ length: criteriaCount }, (_, j) =>
          parseFloat(cellValues[`${i}-${j}`] || "0")
        )
      );

      const res = await computeELECTRERanking(normalized, performanceMatrix);
      onCompute(res);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error computing ELECTRE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="table-container">
        <div className="GG">
          <table className="decision-table">
            <thead>
              <tr>
                <th>{Field2}/{Field1}</th>
                {Array.from({ length: criteriaCount }, (_, i) => (
                  <th key={i}>{Field2} {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="weight-row">
                <td>Weights</td>
                {Array.from({ length: criteriaCount }, (_, i) => (
                  <td key={i}>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={weights[`w${i}`] || ""}
                      onChange={(e) =>
                        setWeights({ ...weights, [`w${i}`]: e.target.value })
                      }
                      className="table-input weight-input"
                    />
                  </td>
                ))}
              </tr>
              {Array.from({ length: optionCount }, (_, i) => (
                <tr key={i}>
                  <td>{Field1} {i + 1}</td>
                  {Array.from({ length: criteriaCount }, (_, j) => (
                    <td key={j}>
                      <input
                        type="number"
                        step="any"
                        value={cellValues[`${i}-${j}`] || ""}
                        onChange={(e) =>
                          setCellValues({ ...cellValues, [`${i}-${j}`]: e.target.value })
                        }
                        className="table-input"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button onClick={handleSubmit} className="submit-button">
        {loading ? "Computing..." : "Compute ELECTRE Ranking"}
      </button>
    </>
  );
}

export default Form;
