import React from "react";

const Services = () => {
  return (
    <div className="container mx-auto my-10">
      <h2 className="text-3xl font-bold text-center">Our Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Counseling</h3>
            <p>Get personalized counseling from experienced professionals.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Workshops</h3>
            <p>Attend workshops on various mental health topics.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Support Groups</h3>
            <p>Join support groups and connect with others.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
