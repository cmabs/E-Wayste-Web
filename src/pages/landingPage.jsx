import { React } from "react";
import { NavLink } from "react-router-dom";
import '../styleSheet/landingPageStyle.css';
import Logo from '../images/E-Wayste-logo.png';

export default function Landing() {
    return (
        <>
            <div className="landingPage">
                <div className="header1">
                    <div className="containButton">
                        <NavLink to="/register"><button className="landingB1">Sign up</button></NavLink>
                        <NavLink to="/login"><button className="landingB1">Sign in</button></NavLink>
                    </div>
                </div>
                <div className="custom-shape-divider-top-1692020718" />
                <div className="containLogo">
                    <img src={Logo} alt="logo" className="imgLogo" />
                </div>
                <h1 className="titleLogo">E-Wayste</h1>
                <div className="custom-shape-divider-top-1692021501" />
                <div className="imgBG" />
                <div className="imgBG2" />
            </div>
        </>
    );
}