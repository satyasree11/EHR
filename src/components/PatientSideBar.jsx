import React from "react";
import logo from "../assets/img/logo/Symbol.png";
import { Navbar } from "react-bootstrap";
import { BsFillPersonFill, BsQuestionCircleFill } from "react-icons/bs";
import {
  FaFileMedical,
  FaFileMedicalAlt,
  FaNotesMedical,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider'
import { useEffect, useState } from "react";

export default function SideBar(props) {
  
  const [wEb3,setwEb3]= useState({
    provider:null,
    web3:null,
  })

  const setupProviderListeners = (provider) => {
    provider.on("chainChanged", () => window.location.reload());
    provider.on("accountsChanged", () => window.location.reload());
  };


 
//get WEB3
  useEffect(() => {
    const loadProvider = async () => {
      try {
        const provider = await detectEthereumProvider();
        if (provider) {
          setupProviderListeners(provider);
          setwEb3({
            provider,
            web3: new Web3(provider),
          });
        } else {
          console.error("Ethereum provider not detected.");
        }
      } catch (error) {
        console.error("Failed to load provider:", error);
      }
    };
    loadProvider();
  }, []);

const [account, setAccount] = useState();

 // get account
    useEffect(()=>{
  
    const getAccount = async()=>{

    try {
        if (wEb3.web3) {
          const accounts = await wEb3.web3.eth.getAccounts();
          setAccount(accounts[0]); // Get the first account
        }
      } catch (error) {
        console.error("Failed to retrieve accounts:", error);
      }
     
  }
    getAccount();

    },[wEb3]);


  /////////////////////
  return (
    <>
      <aside id="sidebar" className="sidebar">
        <div className="border-bottom rounded-bottom shadow-5 mb-5">
          <Navbar.Brand className="logo mb-4 ">
            <Link to="/home">
              <img
                src={logo}
                alt="Logo"
                style={{ height: "50px", marginRight: "5px" }}
              />
            </Link>
            <span className="text-dark">MedVault</span>
          </Navbar.Brand>
        </div>

        <ul className="sidebar-nav mt-4 " id="sidebar-nav">
          <li className="nav-item">
            <NavLink className="nav-link" to={`/PatientProfile?account=${account}`}>
              <i className="bi bi-grid">
                <BsFillPersonFill />
              </i>
              <span>{props.tap1}</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link " to={`/patientRecords?account=${account}`}>
              <i className="bi bi-grid">
                <FaNotesMedical />
              </i>
              <span>{props.tap2}</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="nav-link" to={`/patientPermission?account=${account}`}>
              <i className="bi bi-grid">
                <FaFileMedical />
              </i>
              <span>{props.tap3}</span>
            </NavLink>
          </li>

          <li className="nav-item mt-4">
            <NavLink className="nav-link" to="/">
              <i className="bi bi-grid">
                <FaSignOutAlt />
              </i>
              <span>{props.tap4}</span>
            </NavLink>
          </li>

        </ul>
      </aside>
    </>
  );
}
