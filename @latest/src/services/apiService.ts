const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface AHPWeightsResponse {
  timestamp: string;
  method: string;
  result: {
    weights: number[];
    consistency_ratio: number;
    is_consistent: boolean;
  };
}

export interface AHPFullResponse {
  timestamp: string;
  method: string;
  result: {
    criteria_weights: number[];
    local_alt_weights: number[][];
    global_scores: number[];
    best_alternative: number;
  };
}

export interface ELECTRERankingResponse {
  timestamp: string;
  method: string;
  result: {
    ranking: number[];
    net_flows: number[];
    concordance_threshold: number;
    discordance_threshold: number;
  };
}

export interface CombinedResponse {
  timestamp: string;
  pipeline: string;
  ahp: AHPWeightsResponse['result'];
  electre: ELECTRERankingResponse['result'];
}

export async function computeAHPWeights(
  pairwiseMatrix: number[][]
): Promise<AHPWeightsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ahp/weights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      matrix: pairwiseMatrix,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to compute AHP weights';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status}). Make sure the backend server is running on ${API_BASE_URL}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to backend server at ${API_BASE_URL}. Please make sure the server is running.`);
    }
    throw error;
  }
}

export async function computeAHPFull(payload: {
  criteria_matrix: number[][];
  alt_matrices: number[][][];
}): Promise<AHPFullResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ahp/full`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to compute full AHP result';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status}). Make sure the backend server is running on ${API_BASE_URL}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to backend server at ${API_BASE_URL}. Please make sure the server is running.`);
    }
    throw error;
  }
}

export async function computeELECTRERanking(
  weights: number[],
  performanceMatrix: number[][],
  thresholds?: number[]
): Promise<ELECTRERankingResponse> {
  try {
    const body: any = {
      weights,
      performance_matrix: performanceMatrix,
    };

    if (thresholds) {
      body.thresholds = thresholds;
    }

    const response = await fetch(`${API_BASE_URL}/api/electre/rank`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to compute ELECTRE ranking';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status}). Make sure the backend server is running on ${API_BASE_URL}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to backend server at ${API_BASE_URL}. Please make sure the server is running.`);
    }
    throw error;
  }
}

export async function computeCombined(
  pairwiseMatrix: number[][],
  performanceMatrix: number[][]
): Promise<CombinedResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/combined`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pairwise_matrix: pairwiseMatrix,
      performance_matrix: performanceMatrix,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to compute combined pipeline';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status}). Make sure the backend server is running on ${API_BASE_URL}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to backend server at ${API_BASE_URL}. Please make sure the server is running.`);
    }
    throw error;
  }
}
