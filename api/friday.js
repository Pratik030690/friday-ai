// Friday AI Simple API
export default function handler(req, res) {
  res.json({
    message: "Friday AI is working!",
    status: "online",
    timestamp: Date.now()
  });
}
