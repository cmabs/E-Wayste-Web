import { React } from "react";
import { NavLink } from "react-router-dom";
import '../styleSheet/registerPageStyle.css';
import Logo from '../images/E-Wayste-logo.png';

export default function Register() {
    return (
        <>
            <div className="registerPage">
                <div className="areaForm">
                    <div className="form">
                        <h1 style={{fontFamily: 'inter', fontSize: 35, color: 'rgb(81,175,91)', marginLeft: -3, marginBottom: -15}}>Welcome</h1>
                        <h2 style={{fontFamily: 'inter', fontSize: 20, color: 'rgb(136,132,132)', marginBottom: 40}}>Create an Admin Account</h2>
                        <div className="inputBox">
                            <input type="text" required="required" />
                            <p>First Name</p>
                            <i></i>
                        </div>
                        <div className="inputBox">
                            <input type="text" required="required" />
                            <p>Last Name</p>
                            <i></i>
                        </div>
                        <div className="inputBox">
                            <input type="text" required="required" />
                            <p>Username</p>
                            <i></i>
                        </div>
                        <div className="inputBox">
                            <input type="text" required="required" />
                            <p>Email Address</p>
                            <i></i>
                        </div>
                        <div className="inputBox">
                            <input type="password" required="required" />
                            <p>Password</p>
                            <i></i>
                        </div>
                        <div className="inputBox">
                            <input type="password" required="required" />
                            <p>Confirm Password</p>
                            <i></i>
                        </div>
                        <div style={{marginTop: 50}}>
                            <NavLink to='/home'><button className="accountB1">Create Account</button></NavLink>
                        </div>
                    </div>
                </div>
            </div>
            <div className="formSideDesign">
                <div className="containLogo2">
                    <img src={Logo} alt="logo" className="imgLogo2" />
                </div>
                <h1 className="titleLogo2">E-Wayste</h1>
            </div>
        </>
    );
}