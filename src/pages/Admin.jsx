import React from "react";
import AdminSideBar from "../components/AdminSideBar";
import MyFooter from "../components/MyFooter";
import { FaBed, FaHospitalAlt, FaStethoscope } from "react-icons/fa";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { useEffect, useState } from "react";
import { CChart } from "@coreui/react-chartjs";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";

// import * as echarts from 'echarts';

export default function Admin() {
  const options = {
    indexAxis: "y",
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };
  const location = useLocation();
  const [Hospitaldate, setHospitaldate] = useState([]);

  // const searchParams = new URLSearchParams(location.search);
  // const acount = searchParams.get("account");
  const [acount, setAcount] = useState(null); // Use `acount` as the state name
    useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accountParam = searchParams.get("account"); // Fetch account from URL
    if (accountParam) {
      setAcount(accountParam); // Set the acount state if found
    } else {
      console.error("Account is missing from URL parameters.");
    }
  }, [location]); // This will run whenever the location changes (e.g., URL changes)

  // You can now use the `acount` state throughout your component
  console.log(acount); // Logs the acount if it's set

  const [Contract, setContract] = useState(null);

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
      if (!provider) throw new Error("MetaMask provider not found.");
      console.log("Provider detected:", provider);
      await provider.request({ method: "eth_requestAccounts" });
      console.log("Account access granted.");
       provider.on("chainChanged", () => window.location.reload());
      provider.on("accountsChanged", () => window.location.replace("/"));
      provider.on("disconnect", () => {
        console.log("MetaMask disconnected");
        // Handle disconnection, perhaps reset app state
      });
      console.log("Web3 Instance:", wEb3.web3);
console.log("Provider:", wEb3.provider);
      setwEb3({ provider, web3: new Web3(provider) });
    };
    loadProvider();
  }, []);

  //get Contract
  useEffect(() => {
    const loadContract = async () => {
      if (wEb3.web3) {
        try {
          const contractFile = await fetch("/contracts/MedRecChain.json");
          const contractData = await contractFile.json();
          const networkId = await wEb3.web3.eth.net.getId();
          const networkDetails = contractData.networks[networkId];
          console.log("Network ID:", networkId);
console.log("Network Details:", networkDetails);

          if (networkDetails) {
            const abi = contractData.abi;
            const address = networkDetails.address;
            const contract = new wEb3.web3.eth.Contract(abi, address);

            setContract(contract);
          } else {
            alert("Smart contract not deployed on the detected network.");
            console.error("Network ID not found:", networkId);
          }
        } catch (error) {
          console.error("Error loading contract:", error);
        }
      }
    };

    loadContract();
  }, [wEb3]);

  ///get Number of all Hospitals at system. (By Lenght)
  // const [Hospitaldate, setHospitaldate] = useState([]);
  const [Hospitalname, setHospitalname] = useState([]);
  const Hospitalnames = [];

  useEffect(() => {
    console.log("Contract:", Contract);
    const getAllHospitals = async () => {
      if (!Contract) {
        console.log("Contract is not initialized yet.");
        return;
      }
      if (!acount) {
        console.error("Account is missing from URL parameters.");
        return;
      }
      try {
        const data = await Contract.methods.get_all_hospitals().call({ from: acount });
        const hospitalNames = data.map((hospital) => hospital.name);
        setHospitalname(hospitalNames);
        setHospitaldate(data);
      } catch (error) {
        console.error("Error calling get_all_hospitals:", error);
      }
    };

    getAllHospitals();
  }, [Contract, acount]);

  ///get Number of all Doctors at system.(By Lenght)

  const [Doctordate, setDoctordate] = useState([]);
  const [DocNUM_For_Hos, setDocNUM_For_Hos] = useState([]);
  const DoctorNUM_For_Hos = [];
  useEffect(() => {
  // Fetch all doctors
  const getAllDoctors = async () => {
    if (!Contract || !acount || Hospitaldate.length === 0) {
      console.error("Contract, account, or hospitals not initialized");
      return;
    }
    try {
      const doctors = await Contract.methods.get_all_Doctors().call({ from: acount });
      setDoctordate(doctors);

      // Count doctors for each hospital
      const doctorCountForHospital = Hospitaldate.map(hospital => {
        return doctors.filter(doc => doc.hospital_addr === hospital.addr).length;
      });
      setDocNUM_For_Hos(doctorCountForHospital);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  getAllDoctors();
}, [Contract, acount, Hospitaldate]);

  ///get Number of all patients at system.

  const [Recorddate, setRecorddate] = useState();
 useEffect(() => {
  // Fetch all records
  const getAllRecords = async () => {
    if (!Contract || !acount) {
      console.error("Contract or account not initialized");
      return;
    }
    try {
      const recordCount = await Contract.methods.get_record_number().call({ from: acount });
      setRecorddate(recordCount);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  getAllRecords();
}, [Contract, acount]);

  // get all patients numder
  const [Patientdate, setPatientdate] = useState([]);
  const [PatientNUM_For_Hos, setPatientNUM_For_Hos] = useState([]);
  const Patient_NUM_For_Hos = [];
  ///Date At TABLE for Patients.
useEffect(() => {
  // Fetch all patients
  const getAllPatients = async () => {
    if (!Contract || !acount || Hospitaldate.length === 0) {
      console.error("Contract, account, or hospitals not initialized");
      return;
    }
    try {
      const patients = await Contract.methods.get_all_Patients().call({ from: acount });
      setPatientdate(patients);

      // Count patients for each hospital
      const patientCountForHospital = Hospitaldate.map(hospital => {
        return patients.filter(pat => pat.hospital_addr === hospital.addr).length;
      });
      setPatientNUM_For_Hos(patientCountForHospital);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  getAllPatients();
}, [Contract, acount, Hospitaldate]); 
// if (!Contract || !acount || Hospitaldate.length === 0) {
//     return <div>Loading...</div>; // Display loading state until everything is initialized
//   }

  ///////////////////

  return (
    <>
      <main id="main" className="main">
        <AdminSideBar
          tap1=" Hospitals"
          tap2="Doctors"
          tap3="Home"
          tap4="Log Out"
        />

        <section id="counts" className="counts">
          <div className=" mb-5 mx-auto text-center">
            <h2 className="mb-5 pb-5 ">Admin Dashboard</h2>
          </div>
          <div className="container">
            <div className="row justify-content-center">
              <Link
                to={`/registeredHospitals?account=${acount}`}
                className="col-lg-3 col-md-6 mt-5 mt-md-0"
              >
                <div className="count-box">
                  <div className="icons">
                    <Icon
                      icon="fa-regular:hospital"
                      color="white"
                      width="24"
                      height="24"
                    />
                  </div>
                  <span>{Hospitaldate.length}</span>
                  <p>Registerd Hospitals</p>
                </div>
              </Link>

              <Link
                to={`/registeredDoctors?account=${acount}`}
                className="col-lg-3 col-md-6 mt-5 mt-lg-0"
              >
                <div className="count-box">
                  <div className="icons">
                    <Icon
                      icon="healthicons:doctor-male"
                      color="white"
                      width="24"
                      height="24"
                    />
                  </div>
                  <span>{Doctordate.length}</span>
                  <p>Registered Doctors</p>
                </div>
              </Link>

              <Link
                to={`/registeredPatients?account=${acount}`}
                className="col-lg-3 col-md-6 mt-5 mt-lg-0"
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
            </div>
          </div>
        </section>

        <section className=" py-2 px-5 bg-info-light position-relative overflow-hidden mx-5  ">
          <div className="row">
            <div className="forms col-xl-7">
              <div className="card py-5">
                <div className="container px-5 pt-5 pb-5">
                  <br />
                  <CChart
                    className="mb-4"
                    type="bar"
                    data={{
                      labels: ["Patients", "Patient Records"],
                      datasets: [
                        {
                          label:
                            "The number of medical records compared to the number of patients",
                          backgroundColor: "#24a6a5",
                          data: [Patientdate.length, Recorddate],
                          barPercentage: 5,
                          barThickness: 50,
                          maxBarThickness: 50,
                          minBarLength: 2,
                        },
                      ],
                    }}
                    labels="months"
                  />
                </div>
              </div>
            </div>

            <div className="forms col-xl-5 ">
              <div className="card">
                <div className="container p-5">
                  <CChart
                    type="doughnut"
                    data={{
                      labels: ["Hospitals", "Doctors", "Patients"],
                      datasets: [
                        {
                          backgroundColor: ["#e7c778", "#0dcaf0", "#e9abe7"],

                          data: [
                            Hospitaldate.length,
                            Doctordate.length,
                            Patientdate.length,
                          ],
                        },
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="forms col-xl-12">
              <div className="card">
                <div className="container p-5">
                  <CChart
                    type="bar"
                    options={options}
                    data={{
                      labels: Hospitalname,
                      datasets: [
                        {
                          label: "Doctors",
                          backgroundColor: "#7fe4ed",
                          borderColor: "rgba(220, 220, 220, 1)",
                          pointBackgroundColor: "rgba(220, 220, 220, 1)",
                          pointBorderColor: "#fff",
                          data: DocNUM_For_Hos,
                          barPercentage: 5,
                          barThickness: 50,
                          maxBarThickness: 50,
                          minBarLength: 2,
                        },
                        {
                          label: "Patients",
                          backgroundColor: "#c17bf6",
                          borderColor: "rgba(151, 187, 205, 1)",
                          pointBackgroundColor: "rgba(151, 187, 205, 1)",
                          pointBorderColor: "#fff",
                          data: PatientNUM_For_Hos,
                          barPercentage: 5,
                          barThickness: 50,
                          maxBarThickness: 50,
                          minBarLength: 2,
                        },
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="side-footer">
        <MyFooter />
      </div>
      <script src="../assets/js/main.js"></script>
    </>
  );
}
