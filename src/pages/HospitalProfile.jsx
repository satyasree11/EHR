import React, { useState } from "react";
import hospitalProfile from "../assets/img/slider/hospital.png";
import MyFooter from "../components/MyFooter";
import HospitalSideBar from "../components/HospitalSideBar";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { useEffect } from "react";
import { CChart } from "@coreui/react-chartjs";
import { BsSearch } from "react-icons/bs";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";

export default function HospitalProfile() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const acount = searchParams.get("account");
    const [account, setAccount] = useState();
  const [Contract, setContract] = useState(null);
const [web3Data, setWeb3Data] = useState({ provider: null, web3: null });

  const providerChanged = (provider) => {
    provider.on("chainChanged", (_) => window.location.reload());
  };
  const accountsChanged = (provider) => {
    provider.on("accountsChanged", (_) => window.location.replace("/"));
  };

  //get WEB3
   useEffect(() => {
    const handleProviderEvents = (provider) => {
      provider.on("chainChanged", () => window.location.reload());
      provider.on("accountsChanged", () => window.location.replace("/"));
    };

    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        handleProviderEvents(provider);
        const web3 = new Web3(provider);
        setWeb3Data({ provider, web3 });
      } else {
        alert("Please install MetaMask!");
      }
    };

    loadProvider();
  }, []);
  //get Contract
  useEffect(() => {
    if (web3Data.web3) {
      const loadContract = async () => {
        try {
          const response = await fetch("/contracts/MedRecChain.json");
          const contractJson = await response.json();
          const networkId = await web3Data.web3.eth.net.getId();
          const networkData = contractJson.networks[networkId];

          if (networkData) {
            const contract = new web3Data.web3.eth.Contract(
              contractJson.abi,
              networkData.address
            );
            setContract(contract);

            const accounts = await web3Data.web3.eth.getAccounts();
            setAccount(accounts);
          } else {
            alert("Smart contract not deployed to detected network.");
          }
        } catch (error) {
          console.error("Error loading contract:", error);
        }
      };

      loadContract();
    }
  }, [web3Data]);

  //get acount
 
  // useEffect(() => {
  //   const getAccount = async () => {
  //     const accounts = await web3Data.web3.eth.getAccounts();
  //     setAccount(accounts);
  //   };
  //   getAccount();
  // });

  const [Hospitaldate, setHospitaldate] = useState([]);
  const [Patientdate, setPatientdate] = useState(0);
  const [DoctorMedical_specialty, setDoctorMedical_specialty] = useState([]);
  const [Counts, setspecialtyCounts] = useState([]);
  const [Doctordat, setDoctordat] = useState(0);
  const uniqueMedicalSpecialties = new Set();
  const specialtyCounts = [];
  const [searchValue, setSearchValue] = useState("");
  const [Doctordate, setDoctordate] = useState([]);
  ///Date At TABLE for Doctors.
  // const getalldoctors = async () => {
  //   const date = await Contract.methods
  //     .get_all_Doctors()
  //     .call({ from: acount });
  //   setDoctordate(date);
  // };

  // useEffect(() => {
  //   getalldoctors();
  // }, [Contract]);

  const filteredDoctors = Doctordate.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      doctor.docAddress.includes(searchValue)
  );

  /////////////////////////////

  // Get doctor number at this hospital
  useEffect(() => {
    if (Contract) {
      const fetchDoctors = async () => {
        try {
          const doctors = await Contract.methods
            .get_all_Doctors()
            .call({ from: acount });

          setDoctordate(doctors);

          let doctorCount = 0;
          const specialties = {};
          const uniqueSpecialties = new Set();

          doctors.forEach((doctor) => {
            if (doctor.hospital_addr === account[0]) {
              doctorCount++;
              if (doctor.Medical_specialty) {
                uniqueSpecialties.add(doctor.Medical_specialty);
                specialties[doctor.Medical_specialty] =
                  (specialties[doctor.Medical_specialty] || 0) + 1;
              }
            }
          });

          setDoctorMedical_specialty([...uniqueSpecialties]);
          setspecialtyCounts(specialties);
          setDoctordat(doctorCount);
        } catch (error) {
          console.error("Error fetching doctors:", error);
        }
      };

      fetchDoctors();
    }
  }, [Contract, account]);


  // Get patient number at this hospital

  useEffect(() => {
    if (Contract) {
      const fetchPatients = async () => {
        try {
          const patients = await Contract.methods
            .get_all_Patients()
            .call({ from: acount });

          const patientCount = patients.filter(
            (patient) => patient.hospital_addr === account[0]
          ).length;

          setPatientdate(patientCount);
        } catch (error) {
          console.error("Error fetching patients:", error);
        }
      };

      fetchPatients();
    }
  }, [Contract, account]);

  ///get hospital profile.
  useEffect(() => {
    if (Contract) {
      const fetchHospitalProfile = async () => {
        try {
          const profile = await Contract.methods
            .get_hospita_by_address(acount)
            .call({ from: acount });

          setHospitaldate(profile);
        } catch (error) {
          console.error("Error fetching hospital profile:", error);
        }
      };

      fetchHospitalProfile();
    }
  }, [Contract, acount]);

  ///get number of all  hospital profile.
  const [Hospitaldata, setHospitaldata] = useState([]);
    useEffect(() => {
    if (Contract) {
      const fetchHospitals = async () => {
        try {
          const hospitals = await Contract.methods
            .get_all_hospitals()
            .call({ from: acount });

          setHospitaldata(hospitals);
        } catch (error) {
          console.error("Error fetching hospitals:", error);
        }
      };

      fetchHospitals();
    }
  }, [Contract, acount]);

  // const filteredDoctors = Doctordate.filter(
  //   (doctor) =>
  //     doctor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
  //     doctor.docAddress.includes(searchValue)
  // );
  /////////////////////////////////

  return (
    <>
      <main id="main" className="main">
        <HospitalSideBar
          tap1="Hospital Profile"
          tap2="Add Patient"
          tap3="Log Out"
        />

        <section id="counts" className="counts">
          <div className=" mb-5 mx-auto text-center">
            <span className="mx-auto text-center">
              <h2 className="mb-5 p-2 border-2 border-info border-bottom ">
                Hospital Dashboard
              </h2>
            </span>
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
                  <span>{Hospitaldata.length}</span>
                  <p>Registerd Hospitals</p>
                </div>
              </Link>

              <Link
                to={`/showAllDocrorsForHospital?account=${acount}`}
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
                  <span>{Doctordat}</span>
                  <p>Registered Doctors</p>
                </div>
              </Link>

              <Link
                to={`/showAllPatientForHospital?account=${acount}`}
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
                  <span>{Patientdate}</span>
                  <p>Registered Patients</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="section forms container px-5">
          <div className="card w-100 mx-auto align-center h-100">
            <div className="container  p-4">
              <div className=" p-1">
                <img
                  src={hospitalProfile}
                  alt="Profile"
                  height={100}
                  width={100}
                  className="rounded-circle border border-3 mx-auto d-block p-2"
                />
              </div>
              <div className="mx-auto p-2 align-center">
                <h3 className="card-title text-center mb-4">
                {Hospitaldate.name}
                </h3>

                <div className="card-body  text-muted opacity-75 ">
                  <div className="form-outline row mb-2">
                    <div className="col-xl-3">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Hospital Address:
                      </label>
                    </div>
                    <div className="col-xl-9">{Hospitaldate.place}</div>
                    <hr />
                  </div>

                  <div className="form-outline row mb-2">
                    <div className="col-xl-3">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Hospital Phone:
                      </label>
                    </div>
                    <div className="col-xl-9">{Hospitaldate.phone}</div>
                    <hr />
                  </div>

                  <div className="form-outline row mb-2">
                    <div className="col-xl-3">
                      <label
                        className="text-dark fs-5"
                        htmlFor="form3Example1cg"
                      >
                        Hospital Public Key:
                      </label>
                    </div>
                    <div className="col-xl-9">{Hospitaldate.addr}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-8">
              <div className="card mx-auto align-center p-4">
                <CChart
                  type="bar"
                  data={{
                    labels: ["Patients", "Doctors"],
                    datasets: [
                      {
                        label: "Number of Participants",
                        backgroundColor: ["#5096ad", "#075369"],
                        data: [Patientdate, Doctordat],
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

            <div className="col-xl-4">
              <div className="card mx-auto align-center">
                <div className="container p-5">
                  <CChart
                    className="mb-4"
                    type="radar"
                    data={{
                      labels: DoctorMedical_specialty,
                      datasets: [
                        {
                          label: "Doctor Medical Specialty",
                          backgroundColor: "#dff2f5",
                          borderColor: "#91b1b5",
                          pointBackgroundColor: "rgba(220, 220, 220, 1)",
                          pointBorderColor: "#91b1b5",
                          pointHighlightFill: "#91b1b5",
                          pointHighlightStroke: "rgba(220, 220, 220, 1)",
                          data: Object.values(Counts),
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
    </>
  );
}
