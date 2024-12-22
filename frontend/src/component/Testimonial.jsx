import { Link } from "react-router-dom";

const Testimonial = () => {
  return (
    <section id="contact" className="contact-section">
      {/* Container to heading and testm blocks */}

      <div className="max-w-6xl px-5 mx-auto mt-32 text-center">
        {/* Heading */}
        <h2 className="text-4xl font-bold text-center">Contact Us!</h2>
        <div className="mt-8 ">
          <p>
            To enjoy our services, simply send us an email and we'll get back to
            you as soon as possible!
            <a href="javascript:void(0)" className="text-[#007bff] text-xl ml-4">
                                    <small className="block"></small>
                                    <strong>sse.team3@gmail.com</strong>
                                </a>
          </p>
        </div>
        <div className="mb-8"></div>
      </div>
    </section>
  );
};

export default Testimonial;
