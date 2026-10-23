
function DoctorModule() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        background: "#ffffff",
      }}
    >
      <iframe
        src="https://dnyanaihelpme-doctor-module.hf.space"
        title="MediNexa Doctor Module"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}

export default DoctorModule;