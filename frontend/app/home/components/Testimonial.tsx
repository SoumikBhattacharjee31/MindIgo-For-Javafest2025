import React from "react";

const Testimonial = () => {
  return (
    <div className="container mx-auto my-10">
      <h2 className="text-3xl font-bold text-center">What Our Members Say</h2>
      <div className="carousel w-full mt-8">
        <div className="carousel-item w-full">
          <div className="card bg-base-100 shadow-xl mx-auto w-96">
            <div className="card-body">
              <p>
                "This platform has been a lifesaver. The counseling sessions are
                top-notch."
              </p>
              <p className="text-right">- John Doe</p>
            </div>
          </div>
        </div>
        <div className="carousel-item w-full">
          <div className="card bg-base-100 shadow-xl mx-auto w-96">
            <div className="card-body">
              <p>
                "The support groups have helped me feel less alone in my
                struggles."
              </p>
              <p className="text-right">- Jane Smith</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
