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

export default function ShowAllDocrorsForHospital(props) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const acount = searchParams.get("account");
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

  //get Contract
  useEffect(() => {
    const loadContract = async () => {
      if (wEb3.web3) {
        const contractFile = await fetch("/contracts/MedRecChain.json");
        const contractData = await contractFile.json();
        const networkId = await wEb3.web3.eth.net.getId();
        const networkData = contractData.networks[networkId];

        if (networkData) {
          const abi = contractData.abi;
          const address = networkData.address;
          const contract = new wEb3.web3.eth.Contract(abi, address);
          setContract(contract);
        } else {
          window.alert("Only Ganache network is supported.");
          window.location.reload();
        }
      }
    };
    loadContract();
  }, [wEb3]);

  //get acount
  const [account, setAccount] = useState();
  useEffect(() => {
    const getAccount = async () => {
      const accounts = await wEb3.web3.eth.getAccounts();
      setAccount(accounts);
    };
    getAccount();
  });

  ////////////////////  Search Box  ////////////////////
  const [searchValue, setSearchValue] = useState("");
  const [Doctordata, setDoctorData] = useState([]);
  ///Date At TABLE for Doctors.
   // Fetch all doctors from contract
  const getAllDoctors = async () => {
    if (Contract && account) {
      const data = await Contract.methods.get_all_Doctors().call({ from: account });
      setDoctorData(data);
    }
  };

  useEffect(() => {
    getAllDoctors();
  }, [Contract, account]); 

  const filteredDoctors = Doctordata.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      doctor.docAddress.includes(searchValue)
  );

  /////////////////////////////
  return (
    <>
      <main>
        <section className="section container p-4 mt-4">
          <div className=" align-center">
            <div className="container ">
              <div className="mt-4 mb-4">
                <div className="forms ">
                  <div className="card overflow-auto">
                    <div className="card-body">
                      <div className="row d-flex align-items-center">
                        <div className="col-xl-4">
                          <h1 className="card-title my-3">
                            Registered Doctors
                          </h1>
                        </div>
                        <div className="col-xl-8">
                          <div className="d-flex">
                            <div className="input-group w-50">
                              <input
                                type="text"
                                placeholder="Search for doctor "
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
                      </div>

                      <table className="table table-borderless datatable m-0">
                        <thead>
                          <tr>
                            <th scope="col">Doctor Name</th>
                            <th scope="col">Doctor PK</th>
                            <th scope="col">Medical Specialty</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Hospital PK </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Doctordata.map((doctor) => {
                            if (doctor.hospital_addr == account) {
                              return (
                                <tr key={doctor.docAddress}>
                                  <th scope="row">{doctor.name}</th>
                                  <td>{doctor.docAddress}</td>
                                  <td>{doctor.Medical_specialty}</td>
                                  <td>{doctor.phone}</td>
                                  <td>{doctor.hospital_addr}</td>
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
            </div>
          </div>
        </section>
      </main>
      <MyFooter />
    </>
  );
}
