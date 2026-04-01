async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed.";

    try {
      const payload = await response.json();
      message = payload.detail ?? message;
    } catch {
      message = `Request failed with status ${response.status}.`;
    }

    throw new Error(message);
  }

  return response.json();
}

export function fetchDashboard() {
  return request("/api/dashboard");
}

export function fetchApplicants() {
  return request("/api/applicants");
}

export function createApplicant(payload) {
  return request("/api/applicants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
