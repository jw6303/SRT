db.raffles.updateMany(
    {},
    {
      $set: {
        imageUrl: "http://example.com/image.png",
        prizeDetails: "Win an exclusive prize!",
        isOnChain: false
      }
    }
  );
  