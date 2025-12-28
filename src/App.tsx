import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Users, UserX, Play, ArrowRight, RefreshCw, AlertCircle, Home, Zap,
  Leaf, Coffee, Tv, Trophy, Sparkles, Globe, Ghost, Music, Cpu, Layers, Hand,
  Plus, Trash2, Edit3, Check, Camera, X
} from 'lucide-react';

// --- PALETA DE COLORES PERSONALIZABLE ---
const THEME = {
  bg: "bg-[#0f172a]",       
  card: "bg-[#1e293b]",     
  textMain: "text-white",
  textMuted: "text-slate-400",
  primary: "bg-[#8b5cf6]",  
  primaryHover: "hover:bg-[#7c3aed]",
  secondary: "bg-[#a3e635]", 
  secondaryText: "text-[#a3e635]",
  accentBorder: "border-[#a3e635]", 
  danger: "bg-red-500",
};

// --- MAPA DE ICONOS POR CATEGORÍA ---
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Animales y Naturaleza": <Leaf size={32} />,
  "Vida Cotidiana": <Coffee size={32} />,
  "Anime": <Zap size={32} />,
  "Cine y Televisión": <Tv size={32} />,
  "Deportes": <Trophy size={32} />,
  "Famosos": <Sparkles size={32} />,
  "Mundo y Lugares": <Globe size={32} />,
  "Personajes": <Ghost size={32} />,
  "Música": <Music size={32} />,
  "Ciencia y Tecnología": <Cpu size={32} />
};

// --- BANCO DE PALABRAS ---
const WORD_CATEGORIES: Record<string, string[]> = {
  "Animales y Naturaleza": ["León", "Elefante", "Jirafa", "Tiburón", "Águila", "Pingüino", "Canguro", "Bosque", "Desierto", "Volcán", "Cascada", "Huracán", "Koala", "Oso Panda", "Delfín", "Cactus", "Rosa", "Selva", "Montaña", "Relámpago"],
  "Vida Cotidiana": ["Cepillo de dientes", "Sartén", "Almohada", "Llaves", "Reloj", "Espejo", "Cafetera", "Microondas", "Zapatos", "Paraguas", "Mochila", "Computadora", "Silla", "Cama", "Jabón", "Toalla", "Billetera", "Lentes", "Cuaderno"],
  "Anime": ["Goku", "Naruto", "Pikachu", "Luffy", "Sailor Moon", "Totoro", "Eva 01", "Titan Colosal", "Death Note", "Dragon Ball", "One Piece", "Pokemon", "Espada", "Ninja", "Super Saiyajin", "Carta de Yugi", "Digimon"],
  "Cine y Televisión": ["Harry Potter", "Darth Vader", "Titanic", "Joker", "Avengers", "Game of Thrones", "Breaking Bad", "Stranger Things", "Mickey Mouse", "Batman", "Spiderman", "Shrek", "Toy Story", "Matrix", "Star Wars", "Jurassic Park", "Zombie"],
  "Deportes": ["Fútbol", "Baloncesto", "Tenis", "Natación", "Boxeo", "Golf", "Voleibol", "Béisbol", "Estadio", "Pelota", "Gol", "Árbitro", "Medalla de Oro", "Gimnasio", "Correr", "Yoga", "Karate", "Messi", "Cristiano Ronaldo"],
  "Famosos": ["Shakira", "Michael Jackson", "Elon Musk", "Messi", "Taylor Swift", "Bad Bunny", "Brad Pitt", "Marilyn Monroe", "Einstein", "Frida Kahlo", "Will Smith", "Beyoncé", "La Roca", "Tom Cruise", "Selena Gomez"],
  "Mundo y Lugares": ["Torre Eiffel", "Estatua de la Libertad", "Gran Muralla China", "Pirámides de Egipto", "Coliseo Romano", "Machu Picchu", "Japón", "Brasil", "Nueva York", "París", "Aeropuerto", "Playa", "Museo", "Hospital", "Escuela"],
  "Personajes": ["Mario Bros", "Sonic", "Superman", "Mujer Maravilla", "Sherlock Holmes", "Drácula", "Frankenstein", "Tarzán", "Papá Noel", "Hada de los Dientes", "Sirena", "Unicornio", "Fantasma", "Robot", "Alien"],
  "Música": ["Guitarra", "Piano", "Batería", "Micrófono", "Concierto", "Audífonos", "Vinilo", "Spotify", "Rock", "Pop", "Reggaeton", "Salsa", "Violín", "Trompeta", "Cantante", "DJ", "Banda"],
  "Ciencia y Tecnología": ["Inteligencia Artificial", "Robot", "Cohete", "Astronauta", "Microscopio", "ADN", "Internet", "Smartphone", "Wifi", "Dron", "Hacker", "Satélite", "Marte", "Gravedad", "Laboratorio", "Vacuna", "Chip"]
};

const CATEGORY_KEYS = Object.keys(WORD_CATEGORIES);

// Tipo para el jugador
type Player = {
  id: number;
  name: string;
  photo?: string;
};

export default function ElImpostorApp() {
  // --- AUTO-CONFIGURACIÓN ---
  useLayoutEffect(() => {
    if (!document.getElementById('tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      document.head.appendChild(script);
    }
    if (!document.getElementById('google-font')) {
      const link = document.createElement('link');
      link.id = 'google-font';
      link.rel = 'stylesheet';
      link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // --- ESTADOS ---
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "Jugador 1" },
    { id: 2, name: "Jugador 2" },
    { id: 3, name: "Jugador 3" }
  ]);

  const [numImpostors, setNumImpostors] = useState<number>(1);
  const [gameStage, setGameStage] = useState<'setup' | 'managePlayers' | 'categories' | 'countdown' | 'passAndPlay' | 'discussion'>('setup'); 
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [currentWord, setCurrentWord] = useState<string>('');
  const [playerRoles, setPlayerRoles] = useState<boolean[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [isCoinFlipped, setIsCoinFlipped] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);

  // Estados de Cámara
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraPlayerIndex, setCameraPlayerIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- LÓGICA DE CÁMARA ---
  const startCamera = async (index: number) => {
    setCameraPlayerIndex(index);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accediendo a la cámara:", err);
      alert("No se pudo acceder a la cámara. Verifica los permisos.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setCameraPlayerIndex(null);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraPlayerIndex !== null) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoUrl = canvas.toDataURL('image/png');
        
        const newPlayers = [...players];
        newPlayers[cameraPlayerIndex].photo = photoUrl;
        setPlayers(newPlayers);
        stopCamera();
      }
    }
  };

  // --- LÓGICA DE JUGADORES ---
  const addPlayer = () => {
    if (players.length < 10) {
      const newId = players.length + 1;
      setPlayers([...players, { id: newId, name: `Jugador ${newId}` }]);
    }
  };

  const removePlayer = (indexToRemove: number) => {
    if (players.length > 3) {
      const newPlayers = players.filter((_, index) => index !== indexToRemove);
      setPlayers(newPlayers);
    }
  };

  const updatePlayerName = (index: number, newName: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = newName;
    setPlayers(newPlayers);
  };

  const getMaxImpostors = (count: number): number => {
    if (count <= 4) return 1;
    if (count <= 6) return 2;
    return 3; 
  };

  useEffect(() => {
    const max = getMaxImpostors(players.length);
    if (numImpostors > max) {
      setNumImpostors(max);
    }
  }, [players.length]);

  const incrementImpostors = () => { if (numImpostors < getMaxImpostors(players.length)) setNumImpostors(prev => prev + 1); };
  const decrementImpostors = () => { if (numImpostors > 1) setNumImpostors(prev => prev - 1); };

  // --- LÓGICA DE JUEGO ---
  useEffect(() => {
    let timer: any;
    if (gameStage === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        prepareRound();
      }
    }
    return () => clearTimeout(timer);
  }, [gameStage, countdown]);

  const handleStartGame = () => setGameStage('categories');

  const selectCategory = (category: string) => {
    let wordList: string[];
    if (category === "Todas las anteriores") {
       wordList = Object.values(WORD_CATEGORIES).flat();
    } else {
       wordList = WORD_CATEGORIES[category] || [];
    }
    if (wordList.length > 0) {
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        setCurrentWord(randomWord);
        setSelectedCategory(category);
        setCountdown(5);
        setGameStage('countdown');
    }
  };

  const prepareRound = () => {
    let roles: boolean[] = Array(players.length).fill(false);
    let assignedImpostors = 0;
    while (assignedImpostors < numImpostors) {
      const randomIndex = Math.floor(Math.random() * players.length);
      if (!roles[randomIndex]) {
        roles[randomIndex] = true;
        assignedImpostors++;
      }
    }
    setPlayerRoles(roles);
    setCurrentPlayerIndex(0);
    setIsCoinFlipped(false);
    setGameStage('passAndPlay');
  };

  const handleFlipCoin = () => {
    setIsCoinFlipped(!isCoinFlipped);
  };
  
  const handleNextPlayer = () => {
    setIsCoinFlipped(false);
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      setGameStage('discussion');
    }
  };

  const startNewRound = () => {
    if (selectedCategory) {
        let wordList: string[];
        if (selectedCategory === "Todas las anteriores") {
           wordList = Object.values(WORD_CATEGORIES).flat();
        } else {
           wordList = WORD_CATEGORIES[selectedCategory] || [];
        }
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        setCurrentWord(randomWord);
        setCountdown(5);
        setGameStage('countdown');
    }
  };
  
  const resetGame = () => {
    setGameStage('setup');
    setSelectedCategory(null);
    setCurrentWord('');
    setPlayerRoles([]);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body { margin: 0; background-color: #0f172a; color: white; font-family: sans-serif; }
        .app-container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animation-delay-2000 { animation-delay: 2s; }
        .countdown-anim { animation: pulse-scale 1s infinite; }
        @keyframes pulse-scale {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />

      <div 
        className={`app-container min-h-screen ${THEME.bg} font-sans overflow-hidden flex flex-col items-center justify-center relative text-white`}
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {/* Fondo Patrón */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>

        {/* Decoraciones Neon */}
        <div className={`absolute top-[-50px] left-[-50px] w-64 h-64 ${THEME.primary} rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse`}></div>
        <div className={`absolute bottom-[-50px] right-[-50px] w-64 h-64 ${THEME.secondary} rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse animation-delay-2000`}></div>

        <div className="z-10 w-full max-w-md p-5 flex flex-col h-full max-h-screen">
          
          {/* HEADER */}
          {gameStage !== 'countdown' && gameStage !== 'passAndPlay' && !isCameraOpen && (
            <header className={`flex justify-between items-center mb-6 ${THEME.card} p-4 rounded-2xl border border-slate-700 shadow-xl`}>
              <div className="flex items-center gap-3">
                  <div className={`${THEME.secondary} p-2 rounded-lg`}>
                      <Zap size={24} className="text-slate-900" strokeWidth={3} />
                  </div>
                  <h1 className="text-2xl font-black tracking-tight uppercase text-white">
                    Chamuyero
                  </h1>
              </div>
              {gameStage !== 'setup' && (
                  <button onClick={resetGame} className="p-2 bg-slate-700 rounded-xl hover:bg-slate-600 transition text-slate-300">
                    <Home size={24} />
                  </button>
              )}
            </header>
          )}

          {/* --- MODAL DE CÁMARA (OVERLAY) --- */}
          {isCameraOpen && (
            <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-sm bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
                 <div className="p-4 flex justify-between items-center border-b border-slate-700 bg-slate-800">
                    <h3 className="text-white font-bold">Tomar Selfie</h3>
                    <button onClick={stopCamera} className="text-slate-400 hover:text-white">
                       <X size={24} />
                    </button>
                 </div>
                 <div className="relative aspect-square bg-black">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    {/* Guía circular para la cara */}
                    <div className="absolute inset-0 border-[40px] border-black/50 rounded-full"></div>
                 </div>
                 <div className="p-6 flex justify-center bg-slate-900">
                    <button 
                      onClick={takePhoto}
                      className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 shadow-lg active:scale-90 transition-transform flex items-center justify-center"
                    >
                      <div className="w-12 h-12 bg-transparent border-2 border-black rounded-full"></div>
                    </button>
                 </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* --- PANTALLA: MENÚ PRINCIPAL (SETUP) --- */}
          {gameStage === 'setup' && (
            <div className="flex-1 flex flex-col justify-center space-y-6 animate-fade-in">
              
              {/* Tarjeta: BOTÓN PARA IR A GESTIONAR JUGADORES */}
              <button 
                onClick={() => setGameStage('managePlayers')}
                className={`${THEME.card} p-6 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden w-full group active:scale-[0.98] transition-all`}
              >
                <div className={`absolute top-0 left-0 w-2 h-full ${THEME.primary}`}></div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                           {players.slice(0, 3).map(p => (
                             <div key={p.id} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 overflow-hidden">
                                {p.photo ? (
                                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500"><Users size={16} /></div>
                                )}
                             </div>
                           ))}
                           {players.length > 3 && (
                             <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-800 flex items-center justify-center text-xs font-bold text-white">+{players.length - 3}</div>
                           )}
                        </div>

                        <div className="text-left">
                            <span className="text-xl font-extrabold uppercase text-white block">Jugadores</span>
                            <span className="text-slate-400 text-sm font-semibold">{players.length} participantes</span>
                        </div>
                    </div>
                    <div className={`${THEME.primary} p-3 rounded-xl text-white`}>
                        <Edit3 size={24} />
                    </div>
                </div>
                <div className="mt-4 bg-slate-900/50 p-2 rounded-lg border border-slate-700 text-left">
                    <p className="text-xs text-slate-400 truncate">
                        {players.map(p => p.name).join(", ")}
                    </p>
                </div>
                <p className="mt-3 text-center text-purple-400 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-1">
                    Configurar nombres y fotos <ArrowRight size={16} />
                </p>
              </button>

              {/* Tarjeta: SELECTOR DE CHAMUYEROS */}
              <div className={`${THEME.card} p-6 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-2 h-full ${THEME.secondary}`}></div>
                <div className="flex items-center gap-3 mb-4">
                  <UserX size={28} className="text-white" />
                  <span className="text-xl font-extrabold uppercase text-white">Chamuyeros</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 rounded-2xl p-2 border border-slate-700">
                  <button onClick={decrementImpostors} disabled={numImpostors <= 1} className={`w-12 h-12 flex items-center justify-center ${THEME.card} rounded-xl text-2xl font-bold text-white border border-slate-600 hover:${THEME.secondary} hover:text-slate-900 hover:border-transparent transition disabled:opacity-30`}>-</button>
                  <span className="text-5xl font-black text-white">{numImpostors}</span>
                  <button onClick={incrementImpostors} disabled={numImpostors >= getMaxImpostors(players.length)} className={`w-12 h-12 flex items-center justify-center ${THEME.card} rounded-xl text-2xl font-bold text-white border border-slate-600 hover:${THEME.secondary} hover:text-slate-900 hover:border-transparent transition disabled:opacity-30`}>+</button>
                </div>
                <p className="text-xs font-bold text-center mt-3 text-slate-500 bg-slate-900/50 py-1 px-3 rounded-full inline-block mx-auto w-full border border-slate-800">
                  Máx: {getMaxImpostors(players.length)} para {players.length} jugadores
                </p>
              </div>

              <div className="flex-1"></div>

              <button onClick={handleStartGame} className={`w-full py-4 ${THEME.primary} ${THEME.primaryHover} rounded-2xl text-2xl font-black text-white shadow-lg shadow-purple-900/50 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 uppercase tracking-wide`}>
                Comenzar Partida <Play size={28} fill="white" />
              </button>
            </div>
          )}

          {/* --- PANTALLA: GESTIONAR JUGADORES --- */}
          {gameStage === 'managePlayers' && (
            <div className="flex-1 flex flex-col space-y-4 animate-fade-in overflow-hidden">
                <div className="text-center mb-2">
                    <h2 className="text-xl font-black text-white uppercase">Lista de Jugadores</h2>
                    <p className="text-slate-400 text-sm">Edita nombres y agrega fotos</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {players.map((player, index) => (
                        <div key={player.id} className="flex items-center gap-2 animate-fade-in">
                            <div className="flex-1 relative flex items-center gap-2">
                                <button 
                                  onClick={() => startCamera(index)}
                                  className="w-12 h-12 flex-shrink-0 rounded-xl bg-slate-800 border border-slate-600 overflow-hidden relative hover:border-purple-500 transition-colors group"
                                >
                                   {player.photo ? (
                                     <>
                                       <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Camera size={20} className="text-white" />
                                       </div>
                                     </>
                                   ) : (
                                     <div className="w-full h-full flex items-center justify-center text-slate-500 hover:text-purple-400">
                                       <Camera size={24} />
                                     </div>
                                   )}
                                </button>
                                <input 
                                    type="text" 
                                    value={player.name}
                                    onChange={(e) => updatePlayerName(index, e.target.value)}
                                    maxLength={15}
                                    className={`w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-xl border border-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all`}
                                />
                            </div>
                            <button 
                                onClick={() => removePlayer(index)}
                                disabled={players.length <= 3}
                                className={`p-3 rounded-xl border border-slate-600 transition-colors ${players.length <= 3 ? 'opacity-30 cursor-not-allowed bg-slate-800' : 'bg-slate-800 hover:bg-red-500/20 hover:border-red-500 hover:text-red-500'}`}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pt-4 space-y-3 bg-[#0f172a]">
                    <button 
                        onClick={addPlayer}
                        disabled={players.length >= 10}
                        className={`w-full py-3 rounded-xl border-2 border-dashed border-slate-600 text-slate-400 font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:border-purple-500 hover:text-purple-400 transition-all ${players.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Plus size={20} /> Agregar Jugador ({players.length}/10)
                    </button>

                    <button 
                        onClick={() => setGameStage('setup')}
                        className={`w-full py-4 ${THEME.secondary} hover:brightness-110 rounded-2xl text-slate-900 text-xl font-black uppercase tracking-wide shadow-xl flex items-center justify-center gap-2`}
                    >
                        <Check size={24} strokeWidth={3} /> Finalizado
                    </button>
                </div>
            </div>
          )}

          {/* --- PANTALLA: CATEGORÍAS --- */}
          {gameStage === 'categories' && (
            <div className="flex-1 overflow-y-auto animate-fade-in pb-4">
              <div className="p-2 mb-4">
                  <p className="text-slate-400 font-bold text-center text-sm uppercase tracking-widest">Selecciona una categoría</p>
              </div>
              <div className="flex flex-col gap-3">
                  {CATEGORY_KEYS.map((cat, idx) => (
                    <button key={cat} onClick={() => selectCategory(cat)} className={`${THEME.card} p-5 rounded-3xl border border-slate-700 hover:border-purple-500 hover:bg-slate-700 transition-all flex items-center gap-6 group shadow-lg relative overflow-hidden active:scale-[0.98]`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${idx % 2 === 0 ? THEME.primary : THEME.secondary}`}></div>
                      <div className={`p-4 rounded-2xl bg-slate-800 border border-slate-600 group-hover:bg-slate-900 transition-colors ${idx % 2 === 0 ? 'text-purple-400' : 'text-lime-400'}`}>
                         {CATEGORY_ICONS[cat]}
                      </div>
                      <div className="flex-1 text-left">
                         <span className="font-black text-white text-xl md:text-2xl leading-tight block group-hover:text-purple-300 transition-colors">
                            {cat}
                         </span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <Play size={24} className="text-slate-400" />
                      </div>
                    </button>
                  ))}
                  <button onClick={() => selectCategory("Todas las anteriores")} className={`mt-4 p-6 ${THEME.secondary} rounded-3xl text-slate-900 font-black hover:brightness-110 transition-all text-center flex items-center justify-center gap-4 uppercase tracking-wider text-xl shadow-xl active:scale-[0.98]`}>
                      <Layers size={32} />
                      Mezclar Todo
                  </button>
              </div>
            </div>
          )}

          {/* --- PANTALLA: CUENTA REGRESIVA --- */}
          {gameStage === 'countdown' && (
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center relative">
               <div className={`absolute w-80 h-80 ${THEME.primary} opacity-20 rounded-full blur-3xl animate-pulse`}></div>
               <div className="relative z-10 space-y-8">
                  <div className="bg-slate-800/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-600 inline-block">
                     <p className="text-slate-400 uppercase tracking-widest font-bold text-sm">Preparando partida</p>
                  </div>
                  <div className="scale-150">
                     <span className={`text-[10rem] leading-none font-black ${THEME.secondaryText} drop-shadow-[0_0_15px_rgba(163,230,53,0.5)] countdown-anim`}>
                        {countdown}
                     </span>
                  </div>
                  <div className="space-y-2">
                     <p className="text-white text-2xl font-bold">¡Atentos!</p>
                     <p className="text-slate-400">Categoría elegida:</p>
                     <div className={`inline-block px-8 py-4 ${THEME.card} border ${THEME.accentBorder} rounded-2xl shadow-xl`}>
                        <p className="text-xl font-black text-white uppercase">{selectedCategory}</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* --- PANTALLA: MONEDA GIRATORIA (PASS & PLAY) --- */}
          {gameStage === 'passAndPlay' && (
            <div className="flex-1 flex flex-col items-center w-full h-full relative">
              
              {/* Header de Turno */}
              <div className="mt-8 text-center space-y-2 flex-shrink-0">
                  <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full border border-slate-600 ${THEME.card}`}>
                    <Users size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-300 uppercase">Turno Actual</span>
                  </div>
                  <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-lg break-words px-2 leading-none">
                    {players[currentPlayerIndex].name}
                  </h2>
                  <p className="text-slate-400 text-sm font-semibold max-w-xs mx-auto">
                    Asegúrate de que nadie más mire la pantalla
                  </p>
              </div>

              {/* CONTENEDOR CENTRAL: MONEDA Y TEXTO */}
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                  {/* MONEDA */}
                  <div className="perspective-1000 w-72 h-72 cursor-pointer group mb-6" onClick={handleFlipCoin}>
                      <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${isCoinFlipped ? 'rotate-y-180' : ''}`}>
                        
                        {/* CARA FRONTAL (INCÓGNITA CON FOTO) */}
                        <div className={`absolute w-full h-full backface-hidden rounded-full border-8 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 overflow-hidden`}>
                            {players[currentPlayerIndex].photo ? (
                              <img src={players[currentPlayerIndex].photo} alt="Player" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center">
                                 <Hand size={80} className="text-yellow-900/50 animate-pulse" />
                              </div>
                            )}
                            {/* Brillo */}
                            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-white opacity-10 pointer-events-none"></div>
                        </div>

                        {/* CARA TRASERA (INFORMACIÓN) */}
                        <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-full border-8 border-slate-900 shadow-[0_0_60px_rgba(139,92,246,0.5)] flex items-center justify-center overflow-hidden
                            ${playerRoles[currentPlayerIndex] ? 'bg-gradient-to-br from-red-600 to-red-900' : 'bg-gradient-to-br from-violet-600 to-violet-900'}
                        `}>
                            <div className="text-center p-4 w-full h-full flex flex-col items-center justify-center relative z-10">
                               {playerRoles[currentPlayerIndex] ? (
                                  <div className="animate-fade-in flex flex-col items-center">
                                     <UserX size={56} className="text-white mb-2 drop-shadow-md" />
                                     <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Chamuyero</h3>
                                     <p className="text-red-200 text-xs font-bold px-4 leading-tight">
                                        ¡Shhh! Inventa una palabra.
                                     </p>
                                  </div>
                               ) : (
                                  <div className="animate-fade-in flex flex-col items-center w-full">
                                     <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">Palabra Secreta</p>
                                     <div className="bg-white/10 w-full py-3 backdrop-blur-sm border-y border-white/20 mb-2">
                                        <p className="text-3xl font-black text-white uppercase break-words px-2 leading-none">
                                            {currentWord}
                                        </p>
                                     </div>
                                     <p className="text-violet-300 text-[10px] font-bold uppercase">{selectedCategory}</p>
                                  </div>
                               )}
                            </div>
                        </div>
                      </div>
                  </div>

                  {/* TEXTO DEBAJO DE LA MONEDA */}
                  <div className="animate-pulse">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                          {isCoinFlipped ? (
                            <>Toca de nuevo para ocultar</>
                          ) : (
                            <><Hand size={16} /> TOCA PARA GIRAR</>
                          )}
                      </p>
                  </div>
              </div>

              {/* BOTÓN LISTO - Parte Inferior */}
              <div className="w-full px-4 pb-8 mt-auto">
                  <button 
                    onClick={handleNextPlayer}
                    className={`w-full py-4 ${THEME.secondary} hover:brightness-110 active:scale-[0.98] rounded-2xl text-slate-900 text-xl font-black uppercase tracking-wide shadow-xl transition-all flex items-center justify-center gap-2`}
                  >
                    {currentPlayerIndex < players.length - 1 ? 'Listo, Siguiente' : 'Listo, ¡A Jugar!'} 
                    <ArrowRight size={24} strokeWidth={3} />
                  </button>
              </div>

            </div>
          )}

          {/* --- PANTALLA: DISCUSIÓN / VOTACIÓN --- */}
          {gameStage === 'discussion' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in text-center p-2">
                <div className={`${THEME.card} p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl w-full relative overflow-hidden`}>
                  <div className="relative z-10">
                      <div className="mb-6 flex justify-center">
                      <div className={`${THEME.secondary} p-4 rounded-full shadow-[0_0_30px_rgba(163,230,53,0.4)] animate-pulse`}>
                          <AlertCircle size={48} className="text-slate-900" />
                      </div>
                      </div>
                      <h2 className="text-4xl font-black text-white mb-2 uppercase italic transform -rotate-2">¡A Debatir!</h2>
                      <p className="text-slate-400 font-medium text-lg leading-tight mb-8">
                      ¿Quién está mintiendo? <br/>
                      <span className={`${THEME.secondaryText} font-bold`}>¡Señalen al Chamuyero!</span>
                      </p>
                      <div className="flex flex-col gap-3">
                      <button onClick={startNewRound} className={`w-full py-4 ${THEME.primary} ${THEME.primaryHover} rounded-2xl font-black text-white shadow-lg transition flex items-center justify-center gap-2 uppercase text-lg tracking-wide`}>
                          <RefreshCw size={24} strokeWidth={3} /> Otra Ronda
                      </button>
                      <button onClick={resetGame} className="w-full py-3 bg-transparent border-2 border-slate-600 text-slate-400 hover:text-white hover:border-white rounded-xl font-bold transition uppercase text-sm">
                          Salir al Menú
                      </button>
                      </div>
                  </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}