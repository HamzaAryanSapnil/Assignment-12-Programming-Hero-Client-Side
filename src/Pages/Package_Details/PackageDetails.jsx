import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import "react-datepicker/dist/react-datepicker.css";

import useLoadAllTourGuides from "../../Hooks/useLoadAllTourGuides";
import Container from "../Shared/Container";
import usePackageDetails from "../../Hooks/usePackageDetails";
import { useRef, useState } from "react";
import DatePicker from "react-datepicker";

const PackageDetails = () => {
  const [tourGuides, isLoading] = useLoadAllTourGuides();
  const { id } = useParams();
  console.log("all tour guides from package details: ", tourGuides);
  const [selectGuideErr, setSelectGuideErr] = useState("");
  const [dateError, setDateError] = useState("");

  const navigate = useNavigate();

  // const [packageDetails, loading, reload] = usePackageDetails(id);
  const [packageDetails, loading] = usePackageDetails(id);
  const { image, price, title, tourType, from, to } = packageDetails;

  console.log(packageDetails, to, image, price, title, loading);

  const [imgSelect, setImgSelect] = useState("");
  console.log(typeof image);

  // State variables for zoom effect
  const [showZoom, setShowZoom] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ backgroundPosition: "0% 0%" });

  // Ref for the main image container
  const imgContainerRef = useRef(null);

  //? react date picker
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const { user } = useAuth();

  const givenDate = {
    from: new Date(startDate).toLocaleDateString("en-GB"),
    to: new Date(endDate).toLocaleDateString("en-GB"),
  };

  // const [startDate, setStartDate] = useState(new Date());
  // const [startDate, setStartDate] = useState(new Date());

  const handleSubmit = (event) => {
    event.preventDefault();
    setSelectGuideErr("");
    setDateError("");

    const form = event.target;
    const name = form.name.value;
    const email = form.email.value;
    const date = givenDate;
    const price = form.price.value;
    const tourGuideName = form.tourGuideName.value;

    if (!startDate || !endDate) {
      setDateError("Please select a valid date range.");
      return;
    }

    if (tourGuideName === "Please Select Your Tour Guide") {
      setSelectGuideErr("Please select a tour guide.");
      return;
    }

    const selectedTourGuide = tourGuides.find(
      (tourGuide) => tourGuide.displayName === tourGuideName
    );

    if (!selectedTourGuide) {
      setSelectGuideErr("Invalid tour guide selected.");
      return;
    }

    const {
      _id,
      displayName,
      email: tourGuideEmail,
      ...otherProps
    } = selectedTourGuide;
    console.log(
      "Selected Tour Guide from package details: ",
      selectedTourGuide
    );

    console.log(name, email, date, price, tourGuideName, tourGuideEmail, _id);
    const bookingData = {
      name,
      email,
      date,
      price,
      tourGuideName,
      title,
      tourType,
      image,
      tourGuide: {
        _id,
        displayName,
        email: tourGuideEmail,
        ...otherProps,
      },
    };

    console.log(bookingData);

    navigate("/dashboard/payment", { state: bookingData });
  };
  if (isLoading && loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const handleImg = (img) => {
    // setImgSelect(img);
    // console.log(imgSelect);
    console.log(img);
    setImgSelect(img);
  };

  // Handle mouse enter to show zoom
  const handleMouseEnter = () => {
    setShowZoom(true);
  };

  // Handle mouse move to update zoom position
  const handleMouseMove = (e) => {
    if (!imgContainerRef.current) return;

    const rect = imgContainerRef.current.getBoundingClientRect();
    const { left, top, width, height } = rect;

    // Calculate cursor position relative to the image
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Clamp the values between 0% and 100%
    const clampedX = Math.max(0, Math.min(x, 100));
    const clampedY = Math.max(0, Math.min(y, 100));

    console.log(`Cursor Position: X=${clampedX}%, Y=${clampedY}%`);

    setZoomStyle({
      backgroundPosition: `${clampedX}% ${clampedY}%`,
    });
  };

  // Handle mouse leave to hide zoom
  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  return (
    <Container>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content max-w-full w-full flex-col ">
          {/* Image and Title Section */}
          <div className="flex-1 ">
            <div
              className="relative w-full h-80 md:h-96 rounded-lg shadow-2xl overflow-hidden"
              ref={imgContainerRef}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Main Image */}
              <img
                src={imgSelect ? imgSelect : image}
                alt={title || "Tour Details"}
                className="w-full h-full object-cover"
              />

              {/* Zoom Window */}
              {showZoom && (
                <div
                  className="absolute top-0 left-0 ml-4 w-full h-full border border-gray-300 rounded-lg overflow-hidden shadow-lg"
                  style={{
                    backgroundImage: `url(${imgSelect ? imgSelect : image})`,
                    backgroundSize: "250%", // Adjust the zoom level here
                    backgroundPosition: zoomStyle.backgroundPosition,
                  }}
                ></div>
              )}

              {/* Image Title Overlay */}
              <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full p-4">
                <h1 className="text-2xl md:text-4xl font-extrabold text-white">
                  {title || "Tour Details"}
                </h1>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
              {Array.isArray(image) && image.length > 0 ? (
                image.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-24 h-24 object-cover rounded-lg border-2 cursor-pointer ${
                      imgSelect === img
                        ? "border-yellow-400"
                        : "border-transparent"
                    } hover:border-yellow-400 transition duration-200`}
                    onClick={() => handleImg(img)}
                  />
                ))
              ) : (
                <img
                  src={image}
                  alt="Thumbnail"
                  className="w-24 h-24 object-cover rounded-lg border-2 cursor-pointer border-transparent hover:border-yellow-400 transition duration-200"
                  onClick={() => handleImg(image)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-around items-start w-full box-border">
        <div className=" flex flex-col items-start gap-3  md:ml-10 md:my-10">
          <h3 className="font-bold text-3xl">{title ? title : "loading"}</h3>

          <p className=" my-3  w-full xl:w-9/12 font-poppins font-extralight text-dark-03 ">
            {packageDetails?.description
              ? packageDetails?.description
              : "This is a very good tour. This area is so relaxing, you can enjoy here. You can sun bath, play games, watch movies. There are some hotels nearby. Also there are some 5 star restaurants. You Can enjoy meals here if you are a real foodie"}
          </p>
          {/* img */}
          {/* <div className="w-10 rounded-full bg-red-400 relative">
                <div className="bg-black absolute top-0 ring-0 w-10 rounded-full h-full bg-opacity-15"></div>
                <img
                  className="w-full rounded-full"
                  src={user?.photoURL}
                  alt=""
                />
              </div> */}
        </div>
        <div className="card   shrink-0   shadow-2xl bg-base-100 w-full md:w-7/12">
          <form
            onSubmit={handleSubmit}
            className="card-body"
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>

                <input
                  name="name"
                  type="text"
                  value={user?.displayName}
                  className="input input-bordered"
                  disabled
                  required
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="email"
                  className="input input-bordered"
                  value={user?.email}
                  disabled
                  required
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Price BDT</span>
                <input
                  name="price"
                  type="number"
                  placeholder="price"
                  className="input input-bordered"
                  value={price}
                  disabled
                  required
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tour Date </span>
                <DatePicker
                  className="border-2 border-slate-900"
                  selectsRange={true}
                  minDate={from}
                  maxDate={to}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  isClearable={true}
                  withPortal
                />
                {dateError && <p className="text-red-500">{dateError}</p>}
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tour Guide Name</span>
                <select
                  name="tourGuideName"
                  className="select select-bordered w-full max-w-xs"
                  defaultValue="Please Select Your Tour Guide"
                >
                  <option
                    disabled
                    defaultValue="Please Select Your Tour Guide"
                  >
                    Please Select Your Tour Guide
                  </option>
                  {tourGuides?.map((tourGuide) => (
                    <option
                      key={tourGuide._id}
                      value={tourGuide?.displayName}
                    >
                      {tourGuide?.displayName}
                    </option>
                  ))}
                </select>
                {selectGuideErr && (
                  <p className="text-red-500">{selectGuideErr}</p>
                )}
              </label>
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-outline text-black">Book Now</button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default PackageDetails;
