export default function Home() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: 'url(/landing-bg.png)',
      }}
    >
      {/* Welcome Home Text Overlay */}
      <div className="absolute top-8 left-8">
        <h1 
          className="text-8xl font-bold"
          style={{
            color: '#161748',
            fontFamily: 'var(--font-lora), serif'
          }}
        >
          Welcome Home
        </h1>
      </div>
    </div>
  );
}