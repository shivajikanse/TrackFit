import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ERROR BOUNDARY CAUGHT:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "40px",
            backgroundColor: "#1a1a1a",
            color: "#fff",
            minHeight: "100vh",
            fontFamily: "monospace",
            overflow: "auto",
          }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h1 style={{ color: "#ff3c2f", marginBottom: "20px" }}>
              ⚠️ Component Error
            </h1>

            <div
              style={{
                background: "rgba(255,60,47,0.1)",
                border: "2px solid #ff3c2f",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "4px",
              }}
            >
              <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
                Error Message:
              </p>
              <pre
                style={{
                  background: "#000",
                  padding: "15px",
                  borderRadius: "4px",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  color: "#ff3c2f",
                }}
              >
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>

            {this.state.errorInfo && (
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "20px",
                  borderRadius: "4px",
                }}
              >
                <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
                  Stack Trace:
                </p>
                <pre
                  style={{
                    background: "#000",
                    padding: "15px",
                    borderRadius: "4px",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    fontSize: "12px",
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <button
              onClick={() => (window.location.href = "/trainer")}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: "#ff3c2f",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
