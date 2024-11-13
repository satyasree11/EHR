import React, { useState } from "react";
import { Button } from "react-bootstrap";
import HospitalSideBar from "../components/HospitalSideBar";
import MyFooter from "../components/MyFooter";

import { useLocation } from "react-router-dom";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { useEffect } from "react";
import { BsClipboard2CheckFill, BsQrCode } from "react-icons/bs";
import QrScanner from "qr-scanner";

export default function AddPatient() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const acount = searchParams.get("account");

  const [wEb3, setwEb3] = useState({
    provider: null,
    web3: null,
  });

  const providerChanged = (provider) => {
    provider.on("chainChanged", (_) => window.location.reload());
  };
  const accountsChanged = (provider) => {
    provider.on("accountsChanged", (_) => window.location.replace("/"));
  };

  //get WEB3
  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        providerChanged(provider);
        accountsChanged(provider);
        setwEb3({
          provider,
          web3: new Web3(provider),
        });
      }
    };
    loadProvider();
  }, []);

  const [Contract, setContract] = useState(null);

  ///// get Contract
    useEffect(() => {
    const loadContract = async () => {
      if (!wEb3.web3) return;
      try {
        const contractFile = await fetch("/contracts/MedRecChain.json");
        const contractData = await contractFile.json();
        const networkId = await wEb3.web3.eth.net.getId();
        const networkDetails = contractData.networks[networkId];
        if (networkDetails) {
          const abi = contractData.abi;
          const address = networkDetails.address;
          const contract = new wEb3.web3.eth.Contract(abi, address);
          setContract(contract);
        } else {
          alert("Contract not deployed on this network.");
          console.error("Unsupported network ID:", networkId);
        }
      } catch (error) {
        console.error("Failed to load contract:", error);
      }
    };
    loadContract();
  }, [wEb3.web3]);


  ///////////

  const [isLoading, setIsLoading] = useState(false);

  const [patient, setPatient] = useState({
    patientName: "",
    email: "",
    nationalAddress: "",
    nationalId: "",
    age: "",
    patientPublicKey: "",
    phone: "",
    bloodType: "",
    maritalStatus: "",
    gender: "",
  });

  const handleChange = (e) => {
    setPatient({ ...patient, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Ensure the contract is loaded
  if (!Contract) {
    alert("Contract is not loaded yet.");
    return;
  }

  // Input validations
  const {
    patientName,
    email,
    nationalAddress,
    nationalId,
    age,
    patientPublicKey,
    phone,
    bloodType,
    maritalStatus,
    gender,
  } = patient;

  // Validate required fields
  if (
    !patientName ||
    !email ||
    !nationalAddress ||
    !nationalId ||
    !age ||
    !patientPublicKey ||
    !phone ||
    !bloodType ||
    !maritalStatus ||
    !gender
  ) {
    alert("All fields are required.");
    return;
  }

  // Validate numeric fields
  if (isNaN(nationalId) || isNaN(age)) {
    alert("National ID and Age must be numeric.");
    return;
  }

  // Validate public key format
  if (!wEb3.web3.utils.isAddress(patientPublicKey)) {
    alert("Patient Public Key must be a valid Ethereum address.");
    return;
  }

  // Set loading state and interact with the contract
  setIsLoading(true);
  try {
    const success = await Contract.methods
      .addPatient(
        patientName,
        email,
        nationalAddress,
        nationalId,
        age,
        patientPublicKey,
        phone,
        bloodType,
        maritalStatus,
        gender
      )
      .send({ from: acount });

    if (success) {
      alert("Patient added successfully.");
      
      // Reset patient state after successful submission
      setPatient({
        patientName: "",
        email: "",
        nationalAddress: "",
        nationalId: "",
        age: "",
        patientPublicKey: "",
        phone: "",
        bloodType: "",
        maritalStatus: "",
        gender: "",
      });

      // Refresh the list of patients
      getAllPatients();
    }
  } catch (error) {
    console.error("Failed to add patient:", error);
    alert(`Failed to add patient: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};


  const [Patientdate, setPatientdate] = useState([]);

  ///Date At TABLE for Patients.
    const getAllPatients = async () => {
    if (!Contract || !acount) return;
    try {
      const data = await Contract.methods.get_all_Patients().call({ from: acount });
      setPatientdate(data);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  useEffect(() => {
    getAllPatients();
  }, [Contract, acount]);

  // for QR scanner
  const [fileQr, setFileQr] = useState(null);
  const [dataQr, setDataQr] = useState(null);
  const fileRef = React.useRef();

  const handleClickQR = () => {
    fileRef.current.click();
  };

  const handleChangeQR = async (e) => {
    const qrFile = e.target.files[0];
    setFileQr(qrFile);
    try {
      const result = await QrScanner.scanImage(qrFile);
      setDataQr(result);
    } catch (error) {
      console.error("Failed to scan QR code:", error);
    }
  };

  // Copy QR data to clipboard
  const handleCopyClick = () => {
    if (dataQr) {
      navigator.clipboard.writeText(dataQr.slice(-42));
      setDataQr("Copied!");
    }
  };

  ////
  return (
    <>
      <HospitalSideBar
        tap1="Hospital Profile"
        tap2="Add Patient"
        tap3="Log Out"
      />
      <main id="main" className="main">
        <div className="container">
          <section className="section dashboard">
            <div className="p-5 container">
              <div className="forms">
                <div className="card requests">
                  <div className="card-body">
                    <h1 className="card-title">Add Patient</h1>
                    <form onSubmit={handleSubmit} className="container">
                      <div className="">
                        <div className="card-body ms-5 ">
                          <div className="row">
                            <div className="col-xl-6">
                              <div className="card-body  text-muted opacity-75 ">
                                <div className="form-outline mb-2">
                                  <label htmlFor="patientName">
                                    Patient Name
                                  </label>
                                  <input
                                    name="patientName"
                                    type="text"
                                    id="patientName"
                                    required="required"
                                    className="form-control form-control-lg"
                                    value={patient.patientName}
                                    onChange={handleChange}
                                  />
                                </div>

                                <div className="row d-flex align-items-center">
                                  <div className="col-xl-9">
                                    <label
                                      className=""
                                      htmlFor="form3Example1cg"
                                    >
                                      Patient Public key
                                    </label>
                                    <input
                                      name="patientPublicKey"
                                      type="text"
                                      id="patientPublicKey"
                                      required="required"
                                      minLength="42"
                                      maxLength="42"
                                      className=" form-control form-control-lg"
                                      value={patient.patientPublicKey}
                                      onChange={handleChange}
                                    />
                                  </div>
                                  <div className="col-xl-3">
                                    <label
                                      className="form-label"
                                      htmlFor="form3Example1cg"
                                    >
                                      Scan QR code
                                    </label>
                                    <div className="col-xl-8 d-flex justify-content-center">
                                      <button
                                        type="button"
                                        onClick={handleClickQR}
                                        className=" "
                                      >
                                        <i className="fs-3 px-3 bi bi-grid">
                                          <BsQrCode />
                                        </i>
                                      </button>

                                      <input
                                        type="file"
                                        ref={fileRef}
                                        onChange={handleChangeQR}
                                        accept=".png, .jpg , .jpeg"
                                        className="d-none"
                                      />
                                    </div>
                                  </div>
                                  <div className=" mt-1 d-flex justify-content-center align-items-center">
                                    {dataQr && (
                                      <div className=" mt-1 d-flex justify-content-end align-items-center">
                                        <p className="text-success d-flex justify-content-start">
                                          {dataQr.slice(-42)}
                                        </p>
                                        <span
                                          className="fs-3 mx-3"
                                          onClick={handleCopyClick}
                                          onChange={handleChangeQR}
                                          style={{ cursor: "pointer" }}
                                        >
                                          <i className="bi bi-grid">
                                            <BsClipboard2CheckFill />
                                          </i>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="form-outline mb-2 ">
                                  <label htmlFor="nationalAddress">
                                    Address
                                  </label>
                                  <input
                                    name="nationalAddress"
                                    type="text"
                                    required="required"
                                    id="nationalAddress"
                                    className="form-control form-control-lg"
                                    value={patient.nationalAddress}
                                    onChange={handleChange}
                                  />
                                </div>
                                <div className="form-outline mb-2 ">
                                  <label htmlFor="form3Example1cg">
                                    Your National ID
                                  </label>
                                  <input
                                    name="nationalId"
                                    type="text"
                                    id="nationalId"
                                    required="required"
                                    className="form-control form-control-lg"
                                    value={patient.nationalId}
                                    onChange={handleChange}
                                  />
                                </div>
                                <div className="form-outline mb-2 ">
                                  <label htmlFor="age">Your Age</label>
                                  <input
                                    name="age"
                                    type="number"
                                    id="age"
                                    required="required"
                                    className="form-control form-control-lg"
                                    value={patient.age}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-xl-6">
                              <div className="card-body  text-muted opacity-75 ">
                                <div className="form-outline mb-2 ">
                                  <label htmlFor="email">Patient Email</label>
                                  <input
                                    name="email"
                                    type="email"
                                    id="email"
                                    required="required"
                                    className="form-control form-control-lg"
                                    value={patient.email}
                                    onChange={handleChange}
                                  />
                                </div>
                                <div className="form-outline mb-2">
                                  <label className="" htmlFor="phone">
                                    Phone Number
                                  </label>
                                  <input
                                    name="phone"
                                    type="tel"
                                    id="phone"
                                    required="required"
                                    className=" form-control form-control-lg"
                                    value={patient.phone}
                                    onChange={handleChange}
                                  />
                                </div>

                                <div className="form-outline mb-2 text-muted ">
                                  <label className="" htmlFor="bloodType">
                                    bloodType
                                  </label>
                                  <select
                                    name="bloodType"
                                    className="d-block w-100 opacity-50 form-control-lg"
                                    id="bloodType"
                                    required="required"
                                    value={patient.bloodType}
                                    onChange={handleChange}
                                  >
                                    <option value=""></option>
                                    <option value="+A">+A</option>
                                    <option value="-A">-A</option>
                                    <option value="+B">+B</option>
                                    <option value="-B">-B</option>
                                    <option value="+O">+O</option>
                                    <option value="-O">-O</option>
                                    <option value="+AB">+AB</option>
                                    <option value="-AB">-AB</option>
                                  </select>
                                </div>

                                <div className="form-outline mb-2 text-muted ">
                                  <label className="" htmlFor="maritalStatus">
                                    Marital Status
                                  </label>
                                  <select
                                    name="maritalStatus"
                                    className="d-block w-100 opacity-50 form-control-lg"
                                    id="maritalStatus"
                                    required="required"
                                    value={patient.maritalStatus}
                                    onChange={handleChange}
                                  >
                                    <option value=""></option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                  </select>
                                </div>

                                <div className="">
                                  <div className="form-outline d-flex mt-4 text-muted ">
                                    <label
                                      className="form-label me-4"
                                      htmlFor="gender"
                                    >
                                      Gender
                                    </label>
                                  </div>
                                  <div className="form-check form-check-inline">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="gender"
                                      id="male"
                                      value="male"
                                      onChange={handleChange}
                                    />
                                    <label
                                      className="me-5 form-check-label"
                                      htmlFor="male"
                                    >
                                      Male
                                    </label>
                                  </div>
                                  <div className="form-check form-check-inline">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="gender"
                                      id="female"
                                      value="female"
                                      onChange={handleChange}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="female"
                                    >
                                      Female
                                    </label>
                                  </div>
                                </div>

                                <Button
                                  disabled={isLoading}
                                  type="submit"
                                  className="btn btn-info mt-4 d-block  mx-auto"
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <div className="side-footer">
        <MyFooter />
      </div>
    </>
  );
}
