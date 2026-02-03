const previewOPDSlip = (data) => {
  localStorage.setItem("OPD_PREVIEW_DATA", JSON.stringify(data));
  window.open("registration/opd-slip-preview", "_blank");
};

export default previewOPDSlip;
