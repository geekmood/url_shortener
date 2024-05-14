// A validator middleware to check the presence of the `url` in the body parameter.
// Due to the long and complex nature of URLs, only existence was checked.
export default function urlValidator(req, res, next) {
  if (req.body.url !== "") next();
  else {
    return res.status(412).json({ error: "URL is missing in the body" });
  }
}

// Validating the short URL as per our defined mechanism
// As it was generated and returned by our system, we have the knowledge of how it was created and how to validate it.
// So, validated using the test of presence of numbers and alphabets.
export const shortUrlValidator = (req, res, next) => {
  const { shortURL } = req.params;
  if (shortURL && shortURL.length === 10 && /^[a-z0-9]+$/.test(shortURL))
    next();
  else res.status(404).json({ error: "The provided short URL is invalid" });
};
