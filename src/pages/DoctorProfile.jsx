import React, { useState, useEffect } from "react";
import profile from "../assets/img/slider/doc.png";
import MyFooter from "../components/MyFooter";
import DoctorSideBar from "../components/DoctorSideBar";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { CChart } from "@coreui/react-chartjs";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";

export default function DoctorProfile() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const acount = searchParams.get("account");
  const [Contract, setContract] = useState(null);
  const [wEb3, setwEb3] = useState({
    provider: null,
    web3: null,
  });

  const [account, setAccount] = useState();

  const [Docdate, setDocdate] = useState([]);
  const [Requestdate, setRequestdate] = useState([]);
  const [Patientdate, setPatientdate] = useState([]);
  const [aprove, setAprove] = useState(0);
  const [pending, setPending] = useState(0);

 
  // Load Ethereum Provider
  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        provider.on("chainChanged", () => window.location.reload());
        provider.on("accountsChanged", () => window.location.replace("/"));
        setwEb3({
          provider,
          web3: new Web3(provider),
        });
      } else {
        alert("Please install MetaMask to use this application.");
      }
    };

    loadProvider();
  }, []);

  // Load Smart Contract
  useEffect(() => {
    const loadContract = async () => {
      if (wEb3.web3) {
        const contractFile = await fetch("/contracts/MedRecChain.json");
        const contractData = await contractFile.json();
        const networkId = await wEb3.web3.eth.net.getId();
        const networkInfo = contractData.networks[networkId];

        if (networkInfo) {
          const contract = new wEb3.web3.eth.Contract(
            contractData.abi,
            networkInfo.address
          );
          setContract(contract);
        } else {
          alert("This contract is not deployed on the current network.");
          console.error(`Network ID: ${networkId}`);
        }
      }
    };

    if (wEb3.web3) {
      loadContract();
    }
  }, [wEb3]);

   useEffect(() => {
    const getAccount = async () => {
      if (wEb3.web3) {
        const accounts = await wEb3.web3.eth.getAccounts();
        setAccount(accounts[0]);
      }
    };

    getAccount();
  }, [wEb3]);

   useEffect(() => {
    const getDoctorInfo = async () => {
      if (Contract) {
        try {
          const doctorInfo = await Contract.methods
            .get_doctor_by_address(acount)
            .call({ from: acount });
          setDocdate(doctorInfo);
        } catch (error) {
          console.error("Error fetching doctor info:", error);
        }
      }
    };

    getDoctorInfo();
  }, [Contract, acount]);

  // Get all Request from doctor

 const getAllRequestDates = async () => {
    if (Contract) {
      try {
        const requests = await Contract.methods
          .get_all_requests()
          .call({ from: acount });

        const filteredRequests = requests.filter(
          (req) =>
            req.from_doctor_addr.toLowerCase() === acount.toLowerCase() ||
            req.to_patients_addr.toLowerCase() === acount.toLowerCase()
        );

        setRequestdate(filteredRequests);

        let approvedCount = 0;
        let pendingCount = 0;

        for (const req of filteredRequests) {
          const isApproved = await Contract.methods
            .check_approve_Access(req.from_doctor_addr, req.to_patients_addr)
            .call({ from: acount });

          if (isApproved) {
            approvedCount++;
          } else {
            pendingCount++;
          }
        }

        setAprove(approvedCount);
        setPending(pendingCount);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    }
  };

  useEffect(() => {
    getAllRequestDates();
  }, [Contract, acount]);

  useEffect(() => {
    const getAllPatients = async () => {
      if (Contract) {
        try {
          const patients = await Contract.methods
            .get_all_Patients()
            .call({ from: acount });
          setPatientdate(patients);
        } catch (error) {
          console.error("Error fetching patients:", error);
        }
      }
    };

    getAllPatients();
  }, [Contract, acount]);

  return (
    <>
      <main id="main" className="main">
        <DoctorSideBar
          tap1="Doctor Profile"
          tap2="Make Request"
          tap3="Log Out"
        />
        <section id="counts" className="counts">
          <div className=" mb-5 mx-auto text-center">
            <span className="mx-auto text-center">
              <h2 className="mb-5 p-2 border-2 border-info border-bottom ">
                Doctor Dashboard
              </h2>
            </span>
          </div>
          <div className="container">
            <div className="row justify-content-center">
              <Link
                to={`/RegisteredPatients?account=${acount}`}
                className="col-lg-3 col-md-6 mt-5 mt-md-0"
              >
                <div className="count-box">
                  <div className="icons">
                    <Icon
                      icon="mdi:patient"
                      color="white"
                      width="24"
                      height="24"
                    />
                  </div>
                  <span>{Patientdate.length}</span>
                  <p>Registered Patients</p>
                </div>
              </Link>

              <Link
                to={`/allRequestes?account=${acount}`}
                className="col-lg-3 col-md-6 mt-5 mt-lg-0"
              >
                <div className="count-box">
                  <div className="icons">
                    <Icon
                      icon="carbon:request-quote"
                      color="white"
                      width="24"
                      height="24"
                    />
                  </div>
                  <span>{Requestdate.length}</span>
                  <p>All Requests</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="section container px-5">
          <div className="row d-flex align-items-stretch">
            <div className="forms col-xl-7">
              <div className="card container p-5">
                <div className=" p-1">
                  <img
                    src={profile}
                    alt="Profile"
                    height={100}
                    width={100}
                    className="rounded-circle border border-3 mx-auto d-block p-2"
                  />
                </div>
                <h3 className="card-title text-center mb-5">{Docdate.name}</h3>
                <div className="card-body  text-muted opacity-75 ">
                  <div className="form-outline row mb-2">
                    <div className="col-xl-4">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Doctor PK:
                      </label>
                    </div>
                    <div className="col-xl-8">{Docdate.docAddress}</div>
                    <hr />
                  </div>

                  <div className="form-outline row mb-2">
                    <div className="col-xl-4">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Medical Specialty:
                      </label>
                    </div>
                    <div className="col-xl-8">{Docdate.Medical_specialty}</div>
                    <hr />
                  </div>

                  <div className="form-outline row mb-2">
                    <div className="col-xl-4">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Hospital Name:
                      </label>
                    </div>
                    <div className="col-xl-8">{Docdate.hospital_name}</div>
                    <hr />
                  </div>

                  <div className="form-outline row mb-2">
                    <div className="col-xl-4">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Doctor Phone:
                      </label>
                    </div>
                    <div className="col-xl-8">{Docdate.phone}</div>
                    <hr />
                  </div>

                  <div className="form-outline row mb-2">
                    <div className="col-xl-4">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Email Address:
                      </label>
                    </div>
                    <div className="col-xl-8">{Docdate.email}</div>
                    <hr />
                  </div>

                  <div className="form-outline row mb-2">
                    <div className="col-xl-4">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Doctor Age:
                      </label>
                    </div>
                    <div className="col-xl-8">{Docdate.age}</div>
                    <hr />
                  </div>

                  <div className="form-outline row mb-2">
                    <div className="col-xl-4">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Email:
                      </label>
                    </div>
                    <div className="col-xl-8">{Docdate.email}</div>
                    <hr />
                  </div>

                  <div className="form-outline row mb-0">
                    <div className="col-xl-4">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Doctor Address:
                      </label>
                    </div>
                    <div className="col-xl-8">{Docdate.place}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="forms col-xl-5">
              <div className="card py-5">
                <div className="card-body m-4 pb-5">
                  <CChart
                    className="mt-4"
                    type="polarArea"
                    data={{
                      labels: [
                        "All Requests",
                        "Approved Requests",
                        "Pending Requests",
                      ],
                      datasets: [
                        {
                          data: [Requestdate.length, aprove, pending],
                          backgroundColor: ["#FF6384", "#4BC0C0", "#FFCE56"],
                        },
                      ],
                    }}
                  />
                  <br />
                  <br />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="side-footer">
        <MyFooter />
      </div>
      <script src="assets/js/coreui.bundle.min.js"></script>
    </>
  );
}
