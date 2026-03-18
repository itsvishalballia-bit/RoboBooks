import React from 'react';
import Navbar from '../homepage/components/Navbar';
import Footer from '../homepage/components/Footer';
import SignIn from './components/signin';

const SignInPage = () => {
  return (
    <>
      <Navbar />
      <div className="bg-[linear-gradient(180deg,#f7fbff_0%,#eef7ff_32%,#ffffff_100%)] pt-16">
        <SignIn />
      </div>
      <Footer />
    </>
  );
};

export default SignInPage;
