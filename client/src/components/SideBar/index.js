/*
  Displays a paginates list of image/video sources
*/
import React, { useState } from "react";
import "./style.css";
import ReactPaginate from "react-paginate";
import useWindowDimensions from "./useWindowDimensions";

const imageTotalSize = 70 + 20;
const headerSize = 250;
const previewSize = 400 + 0;
const widthBreakpoint = 1024;

function Items({ currentItems, setSource, path, isVideo, selectedImage }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: "1em",
        marginRight: "1em",
      }}
    >
      {currentItems &&
        currentItems.map((item) => (
          <div
            onClick={() => setSource(item)}
            key={"preview-" + path + item}
            style={{
              width: "100%",
              height: "100%",
              marginBottom: "20px",
              cursor: "pointer",
            }}
            className={selectedImage == item ? "border" : ""}
          >
            {isVideo ? (
              <video
                src={path + item}
                style={{ objectFit: "cover", width: "100%", maxHeight: "70px", minHeight: "70px" }}
              ></video>
            ) : (
              <img
                src={path + item}
                style={{ objectFit: "cover", width: "100%", maxHeight: "70px", minHeight: "70px" }}
              ></img>
            )}
          </div>
        ))}
    </div>
  );
}

export default function PaginatedItems({
  setSource,
  sources,
  path,
  isVideo,
  selectedImage,
  title,
}) {
  const { height, width } = useWindowDimensions();
  // Adjust for header + image preview (only visible on small screens)
  let toDeduct = headerSize;
  if (width < widthBreakpoint) {
    toDeduct += previewSize;
  }
  // Adjust items per page accordingly - don't ask
  const perPage =
    (height || 0) > toDeduct + imageTotalSize ? Math.floor((height - toDeduct) / imageTotalSize) : 1;
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + perPage;
  const currentItems = sources.slice().reverse().slice(itemOffset, endOffset);
  const pageCount = Math.ceil(sources.length / perPage);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const newOffset = (event.selected * perPage) % sources.length;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        flex: 1,
        borderLeft: "2px solid rgba(56, 60, 62, 0.7)"
      }}
    >
      <h3 style={{ color: "#ffffff", alignSelf: "center" }}>{title}</h3>
      <Items
        currentItems={currentItems}
        setSource={setSource}
        path={path}
        isVideo={isVideo}
        selectedImage={selectedImage}
      />

      <ReactPaginate
        breakClassName={"item break-me "}
        breakLabel={".."}
        activeClassName={"item active "}
        containerClassName={"pagination"}
        disabledClassName={"disabled-page"}
        marginPagesDisplayed={0}
        nextClassName={"item next "}
        nextLabel=">"
        onPageChange={(e) => handlePageClick(e)}
        pageCount={pageCount}
        pageClassName={"item pagination-page "}
        pageRangeDisplayed={0}
        previousClassName={"item previous"}
        previousLabel="<"
      />
    </div>
  );
}
