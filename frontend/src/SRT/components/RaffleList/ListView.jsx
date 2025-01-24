import React from "react";
import ProgressBar from "../ProgressBar"; // Corrected path to ProgressBar
import "./ListView.css"; // Import CSS for ListView

const ListView = ({ raffles }) => {
  if (!raffles || raffles.length === 0) {
    return <p className="no-raffles">No raffles available at the moment.</p>;
  }

  return (
    <div className="raffle-list">
      {raffles.map((raffle) => {
        const {
          _id,
          raffleName = "Unnamed Raffle",
          prizeDetails = {},
          entryFee = 0,
          participants = {},
          time = {},
          status = {},
          onChainDetails = null,
          offChainDetails = null,
          analytics = {},
        } = raffle;

        const {
          title = "N/A",
          description = "No description available.",
          imageUrl = "",
          type: prizeType = "Unknown",
          amount = 0,
        } = prizeDetails;

        const ticketsSold = participants?.ticketsSold || 0;
        const maxTickets = participants?.max || 1;
        const endTime = time?.end || "Unknown end time";
        const statusText = status?.current || "Unknown";
        const fulfillmentStatus = status?.fulfillment || "Unknown";

        return (
          <div key={_id} className="raffle-card list">
            {/* Raffle Name */}
            <h3 className="raffle-title">{raffleName}</h3>

            {/* Prize Title */}
            <p className="raffle-prize-title">
              Prize: {title} ({prizeType})
            </p>

            {/* Image */}
            <img
              src={imageUrl}
              alt={title ? `Image of ${title}` : "Raffle Image"}
              className="raffle-image"
            />

            {/* Description */}
            <p className="raffle-description">
              {description || "No description available."}
            </p>

            {/* Entry Fee */}
            <p className="raffle-entry-fee">
              Entry Fee: <span>{entryFee} SOL</span>
            </p>

            {/* Participants */}
            <p className="raffle-participants">
              Participants:{" "}
              <span>
                {ticketsSold} / {maxTickets}
              </span>
            </p>

            {/* Status */}
            <p className="raffle-status">
              Status: <span className="status-highlight">{statusText}</span> - Fulfillment:{" "}
              <span className="fulfillment-highlight">{fulfillmentStatus}</span>
            </p>

            {/* Analytics */}
            <p className="raffle-analytics">
              Total Tickets: {analytics.totalTickets || 0} - Total Refunds:{" "}
              {analytics.totalRefunds || 0}
            </p>

            {/* Progress Bar */}
            <ProgressBar
              current={ticketsSold}
              total={maxTickets}
              min={Math.ceil(maxTickets * 0.3)}
              entryFee={entryFee}
              endTime={endTime}
            />

            {/* View More Details Button */}
            <a
              href={`/raffles/${_id}`}
              className="view-details-btn"
              aria-label={`View details for ${raffleName}`}
            >
              View More Details
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default ListView;
