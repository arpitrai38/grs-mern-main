import React from 'react'
import { Link } from 'react-router-dom'
import { FaUser } from "react-icons/fa";
const Home = () => {
    return (
        <div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-3 text-center mt-3 mx-auto">
                        <img src="./src/assets/image.png" alt="" className='img-fluid w-50' />
                    </div>

                </div>
                <div className="row">
                    <div className="col-sm-8 mx-auto text-center">
                        <h2 className='my-2 text-primary'>Grievance Redressal System</h2>
                        <p className='my-2 text-secondary fs-5 fst-italic'>"Welcome to the Grievance Redressal System. This system is designed to help you voice your concerns and get them resolved in a timely and efficient manner."</p>
                    </div>
                </div>
                <div className="row my-5">
                    <div className="col-sm-4">
                        <Link to="/admin/login" className="btn w-100 h-100 box">
                            <div className="card">
                                <div className="row">
                                    <div className="col-sm-6 text-center d-flex align-items-center justify-content-center">
                                        <FaUser className='display-1 ' />
                                    </div>
                                    <div className="col-sm-6 my-5 text-start">
                                        <h5 className="card-title text-primary">Admin Login</h5>
                                        <p className="card-text">For Admin Login</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="col-sm-4">
                        <Link to="/login" className="btn w-100 h-100 box">
                            <div className="card">
                                <div className="row">
                                    <div className="col-sm-6 text-center d-flex align-items-center justify-content-center">
                                        <FaUser className='display-1 ' />
                                    </div>
                                    <div className="col-sm-6 my-5 text-start">
                                        <h5 className="card-title text-primary">Student Login</h5>
                                        <p className="card-text">For Student Login</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="col-sm-4">
                        <Link to="/register" className="btn w-100 h-100 box">
                            <div className="card">
                                <div className="row">
                                    <div className="col-sm-6 text-center d-flex align-items-center justify-content-center">
                                        <FaUser className='display-1 ' />
                                    </div>
                                    <div className="col-sm-6 my-5 text-start">
                                        <h5 className="card-title text-primary">Register</h5>
                                        <p className="card-text">Register for new account</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
                {/* footer section start */}
                <div className="row bottom-0 ">
                    <div className="col-sm-12 bg-primary">
                        <footer className="bg-primary text-center text-lg-start">
                            <div className="text-center p-2 text-white fs-6 fw-bold">
                                © {new Date().getFullYear()} Copyright: Grievance Redressal System. Designed and Developed By Softpro India Computer Technology Pvt. Ltd.
                            </div>
                        </footer>
                    </div>
                </div>
                {/* footer section end */}
            </div>
        </div>

    )
}

export default Home
