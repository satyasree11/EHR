import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import MyFooter from "../components/MyFooter";
import PatientSideBar from "../components/PatientSideBar";
import {
  BsCheckCircleFill,
  BsFillTrash3Fill,
  BsClipboard2CheckFill,
  BsQrCode,
  BsSearch,
} from "react-icons/bs";
import { useLocation } from "react-router-dom";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import QrScanner from "qr-scanner";

export default function PatientPermission() {
  // for QR scanner
  const [fileQr, setFileQr] = useState(null);
  const [dataQr, setDateQr] = useState(null);
  const fileRef = React.useRef();

  const handleClickQR = () => {
    fileRef.current.click();
  };

  const handleChangeQR = async (e) => {
    const fileQr = e.target.files[0];
    setFileQr(fileQr);
    const result = await QrScanner.scanImage(fileQr);
    setDateQr(result);
  };

  // copy pk to clipboard

  const handleCopyClick = () => {
    navigator.clipboard.writeText(dataQr.slice(-42));
    setDateQr("Copied !");
  };

  ////
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
  const [isLoading, setIsLoading] = useState(false);

  ///// get Contract
  useEffect(() => {
    const loadcontract = async () => {
      const contractfile = await fetch("/contracts/MedRecChain.json");
      const convert = await contractfile.json();
      const networkid = await wEb3.web3.eth.net.getId();
      const networkDate = convert.networks[networkid];
      if (networkDate) {
        const abi = convert.abi;
        const address = convert.networks[networkid].address;
        const contract = await new wEb3.web3.eth.Contract(abi, address);

        setContract(contract);
      } else {
        window.alert("only ganache");
        window.location.reload();
        console.log(networkid);
      }
    };

    loadcontract();
  }, [wEb3]);

  ////////////////////
  const [Doctor, setDoctor] = useState({
    DoctorPublickey: "",
  });

  const handleChange = (e) => {
    setDoctor({ ...Doctor, [e.target.name]: e.target.value });
  };

  // for patient Give Permission.
  const handleSubmit = (e) => {
    try {
      setIsLoading(true);
      e.preventDefault();
      const sendrequestAccess = async (doc) => {
        await Contract.methods
          .send_request_Access(acount, doc.DoctorPublickey)
          .send(
            {
              from: acount,
            },
            function (error) {
              if (error) {
                setIsLoading(false);
              }
            }
          );

        await Contract.methods.approveAccess(doc.DoctorPublickey).send(
          {
            from: acount,
          },
          function (error) {
            if (error) {
              setIsLoading(false);
            }
          }
        );
        alert("Request sended and approved Successfully.");
        setIsLoading(false);
      };
      sendrequestAccess(Doctor);
    } catch (e) {
      alert("Request Not sended !!.");
      setIsLoading(false);
    }
  };

  const [Requestdate, setRequestdate] = useState([]);

  const getallRequestdates = async () => {
    const date = await Contract.methods
      .get_all_requests()
      .call({ from: acount });
    setRequestdate(date);
  };
  getallRequestdates();

  function convertTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }

  const buttonStyle = {
    backgroundColor: "transparent",
    color: "green",
    fontSize: "16px",
    border: "none",
    padding: "5px 40px ",
  };
  const buttonrevoke = {
    backgroundColor: "transparent",
    color: "red",
    fontSize: "16px",
    border: "none",
    padding: "5px 40px ",
  };
  /////////////

  //approve
  const handleClick = async (doc) => {
    try {
      setIsLoading(true);

      const a = await Contract.methods.approveAccess(doc).send(
        {
          from: acount,
        },
        function (error) {
          if (error) {
            if (error.message.includes("User denied transaction signature.")) {
              alert("Request approved Failled!");
              setIsLoading(false);
            } else {
              alert("This Request alraedy been Approved!!!");
              setIsLoading(false);
            }
          } else {
            alert("Request approved Successfully!");
            setIsLoading(false);
          }
        }
      );
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  //revoke
  const handleRevoke = async (doc) => {
    try {
      setIsLoading(true);
      const d = await Contract.methods.rejectAccess(doc).send(
        {
          from: acount,
        },
        function (error) {
          if (error) {
            if (error.message.includes("User denied transaction signature.")) {
              alert("Request Rejected Failled!");
              setIsLoading(false);
            } else {
              alert("This Request alraedy  Rejected!!!");
              setIsLoading(false);
            }
          } else {
            alert("Request Rejected Successfully!");
            setIsLoading(false);
          }
        }
      );
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  //////////////////// Search Box //////////////////

  const [searchValue, setSearchValue] = useState("");

  const [Patientdate, setPatientdate] = useState([]);

  ///Date At TABLE for Patients.
  const getallPatients = async () => {
    const date = await Contract.methods
      .get_all_Patients()
      .call({ from: acount });
    setPatientdate(date);
  };

  useEffect(() => {
    getallPatients();
  }, [Contract]);

  const filteredPatients = Requestdate.filter(
    (date) =>
      date.patient_name.toLowerCase().includes(searchValue.toLowerCase()) ||
      date.to_patients_addr.includes(searchValue)
  );
  ////////////////////////////////////////////////

  /////////////////////////////////////
  return (
    <>
      <main id="main" className="main container perm">
        <PatientSideBar
          tap1="Patient Profile"
          tap2="My Records"
          tap3="Permission & Requests"
          tap4="Log Out"
        />

        <section className="section dashboard mx-auto ms-5 me-0 pe-0 py-5 ">
          <div className="container">
            <div className="forms">
              <div className="card requests">
                <div className="card-body mx-5 px-5 ">
                  <h1 className="card-title">Give Permission</h1>

                  <form
                    onSubmit={handleSubmit}
                    className="container justify-content-start "
                  >
                    <div className="">
                      <div className="card-body ms-5 ">
                        <div className="form-outline text-muted ">
                          <label
                            className="form-label"
                            htmlFor="form3Example1cg"
                          >
                            Your public Key
                          </label>
                          <input
                            name="patientPublickey"
                            type="text"
                            id="form3Example1cg"
                            className=" form-control form-control-lg"
                            value={acount}
                            disabled
                          />
                        </div>

                        <div className="form-outline mt-4 text-muted row">
                          <div className="col-xl-10">
                            <label
                              className="form-label"
                              htmlFor="form3Example1cg"
                            >
                              Doctor Public Key
                            </label>
                            <input
                              name="DoctorPublickey"
                              type="text"
                              id="form3Example1cg"
                              required="required"
                              minlength="42"
                              maxlength="42"
                              className=" form-control form-control-lg"
                              value={Doctor.DoctorPublickey}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-xl-2">
                            <label
                              className="form-label"
                              htmlFor="form3Example1cg"
                            >
                              Scan QR code
                            </label>
                            <div className="col-xl-6 d-flex justify-content-center">
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

                        <div className="row my-5">
                          <div className="col-4"></div>
                          <div className="col-8">
                            <Button
                              disabled={isLoading}
                              type="submit"
                              className="btn btn-info pe-5 ps-5 ms-5 "
                            >
                              Submit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 mb-4 container ">
            <div className="forms">
              <div className="card overflow-auto">
                <div className="card-body">
                  <div className="row d-flex align-items-center">
                    <div className="col-xl-4">
                      <h3 className="card-title">Requests For You</h3>
                    </div>
                    <div className="col-xl-8">
                      <div className="input-group w-50 mb-3">
                        <input
                          type="text"
                          placeholder="Search for patient "
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          className="form-control"
                        />
                        <span className="input-group-text">
                          <BsSearch />
                        </span>
                      </div>
                    </div>
                  </div>
                  <table className="table table-borderless datatable mx-0">
                    <thead>
                      <tr>
                        <th scope="col">Doctor Name</th>
                        <th scope="col">Doctor Public Key</th>
                        <th scope="col">Date</th>
                        <th scope="col">Approve Request</th>
                        <th scope="col">Revoke Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Requestdate.map((date) => {
                        if (date.to_patients_addr == acount) {
                          return (
                            <tr>
                              <td>{date.doctor_name}</td>
                              <td>{date.from_doctor_addr}</td>

                              <td>{convertTimestamp(date.date)}</td>

                              <td>
                                <button
                                  disabled={isLoading}
                                  onClick={() =>
                                    handleClick(date.from_doctor_addr)
                                  }
                                  style={buttonStyle}
                                >
                                  <BsCheckCircleFill />
                                </button>
                              </td>
                              <td>
                                <button
                                  disabled={isLoading}
                                  onClick={() =>
                                    handleRevoke(date.from_doctor_addr)
                                  }
                                  style={buttonrevoke}
                                >
                                  <BsFillTrash3Fill />
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      }).filter(
                        (date) =>
                          date !== undefined &&
                          (date.props.children[0].props.children
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()) ||
                            date.props.children[1].props.children.includes(
                              searchValue
                            ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="side-footer">
        <MyFooter />
      </div>
    </>
  );
}
