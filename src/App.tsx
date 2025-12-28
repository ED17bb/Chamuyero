import { useState, useEffect, useLayoutEffect } from 'react';
import { 
  Users, UserX, Play, ArrowRight, RefreshCw, ChevronUp, AlertCircle, Home, Star, Zap, Smile,
  Leaf, Coffee, Tv, Trophy, Sparkles, Globe, Ghost, Music, Cpu, Layers, Timer
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

  // Estados
  const [numPlayers, setNumPlayers] = useState<number>(4);
  const [numImpostors, setNumImpostors] = useState<number>(1);
  // Añadimos 'countdown' a los stages posibles
  const [gameStage, setGameStage] = useState<'setup' | 'categories' | 'countdown' | 'passAndPlay' | 'discussion'>('setup'); 
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [currentWord, setCurrentWord] = useState<string>('');
  const [playerRoles, setPlayerRoles] = useState<boolean[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);

  // --- LÓGICA DE CONTEO REGRESIVO ---
  useEffect(() => {
    let timer: any;
    if (gameStage === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        // Cuando llega a 0, iniciamos la ronda
        prepareRound();
      }
    }
    return () => clearTimeout(timer);
  }, [gameStage, countdown]);

  // Validaciones
  const getMaxImpostors = (players: number): number => {
    if (players <= 4) return 1;
    if (players <= 6) return 2;
    return 3; 
  };

  useEffect(() => {
    const max = getMaxImpostors(numPlayers);
    if (numImpostors > max) {
      setNumImpostors(max);
    }
  }, [numPlayers]);

  const incrementPlayers = () => { if (numPlayers < 10) setNumPlayers(prev => prev + 1); };
  const decrementPlayers = () => { if (numPlayers > 3) setNumPlayers(prev => prev - 1); };
  const incrementImpostors = () => { if (numImpostors < getMaxImpostors(numPlayers)) setNumImpostors(prev => prev + 1); };
  const decrementImpostors = () => { if (numImpostors > 1) setNumImpostors(prev => prev - 1); };

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
        // En lugar de preparar ronda, vamos al contador
        setCountdown(5);
        setGameStage('countdown');
    }
  };

  const prepareRound = () => {
    let roles: boolean[] = Array(numPlayers).fill(false);
    let assignedImpostors = 0;
    while (assignedImpostors < numImpostors) {
      const randomIndex = Math.floor(Math.random() * numPlayers);
      if (!roles[randomIndex]) {
        roles[randomIndex] = true;
        assignedImpostors++;
      }
    }
    setPlayerRoles(roles);
    setCurrentPlayerIndex(0);
    setIsRevealed(false);
    setGameStage('passAndPlay');
  };

  const handleReveal = () => setIsRevealed(true);
  
  const handleNextPlayer = () => {
    setIsRevealed(false);
    if (currentPlayerIndex < numPlayers - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      setGameStage('discussion');
    }
  };

  const startNewRound = () => {
    if (selectedCategory) {
        // Obtenemos nueva palabra
        let wordList: string[];
        if (selectedCategory === "Todas las anteriores") {
           wordList = Object.values(WORD_CATEGORIES).flat();
        } else {
           wordList = WORD_CATEGORIES[selectedCategory] || [];
        }
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        setCurrentWord(randomWord);
        // Vamos directo al contador otra vez para mantener la emoción
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
      `}} />

      <div 
        className={`app-container min-h-screen ${THEME.bg} font-sans overflow-hidden flex flex-col items-center justify-center relative text-white`}
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {/* Fondo Patrón Oscuro */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>

        {/* Decoraciones de Luz de Neón */}
        <div className={`absolute top-[-50px] left-[-50px] w-64 h-64 ${THEME.primary} rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse`}></div>
        <div className={`absolute bottom-[-50px] right-[-50px] w-64 h-64 ${THEME.secondary} rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse animation-delay-2000`}></div>

        <div className="z-10 w-full max-w-md p-5 flex flex-col h-full max-h-screen">
          
          {/* HEADER (Oculto en contador y juego activo) */}
          {gameStage !== 'passAndPlay' && gameStage !== 'countdown' && (
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

          {/* --- PANTALLA: CONFIGURACIÓN --- */}
          {gameStage === 'setup' && (
            <div className="flex-1 flex flex-col justify-center space-y-6 animate-fade-in">
              
              {/* Tarjeta Jugadores */}
              <div className={`${THEME.card} p-6 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-2 h-full ${THEME.primary}`}></div>
                <div className="flex items-center gap-3 mb-4">
                  <Users size={28} className="text-white" />
                  <span className="text-xl font-extrabold uppercase text-white">Jugadores</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 rounded-2xl p-2 border border-slate-700">
                  <button onClick={decrementPlayers} disabled={numPlayers <= 3} className={`w-12 h-12 flex items-center justify-center ${THEME.card} rounded-xl text-2xl font-bold text-white border border-slate-600 hover:${THEME.primary} hover:border-transparent transition disabled:opacity-30`}>-</button>
                  <span className="text-5xl font-black text-white">{numPlayers}</span>
                  <button onClick={incrementPlayers} disabled={numPlayers >= 10} className={`w-12 h-12 flex items-center justify-center ${THEME.card} rounded-xl text-2xl font-bold text-white border border-slate-600 hover:${THEME.primary} hover:border-transparent transition disabled:opacity-30`}>+</button>
                </div>
              </div>

              {/* Tarjeta Chamuyeros */}
              <div className={`${THEME.card} p-6 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-2 h-full ${THEME.secondary}`}></div>
                <div className="flex items-center gap-3 mb-4">
                  <UserX size={28} className="text-white" />
                  <span className="text-xl font-extrabold uppercase text-white">Chamuyeros</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 rounded-2xl p-2 border border-slate-700">
                  <button onClick={decrementImpostors} disabled={numImpostors <= 1} className={`w-12 h-12 flex items-center justify-center ${THEME.card} rounded-xl text-2xl font-bold text-white border border-slate-600 hover:${THEME.secondary} hover:text-slate-900 hover:border-transparent transition disabled:opacity-30`}>-</button>
                  <span className="text-5xl font-black text-white">{numImpostors}</span>
                  <button onClick={incrementImpostors} disabled={numImpostors >= getMaxImpostors(numPlayers)} className={`w-12 h-12 flex items-center justify-center ${THEME.card} rounded-xl text-2xl font-bold text-white border border-slate-600 hover:${THEME.secondary} hover:text-slate-900 hover:border-transparent transition disabled:opacity-30`}>+</button>
                </div>
                <p className="text-xs font-bold text-center mt-3 text-slate-500 bg-slate-900/50 py-1 px-3 rounded-full inline-block mx-auto w-full border border-slate-800">
                  Máx: {getMaxImpostors(numPlayers)} para esta cantidad
                </p>
              </div>

              <div className="flex-1"></div>

              <button 
                onClick={handleStartGame}
                className={`w-full py-4 ${THEME.primary} ${THEME.primaryHover} rounded-2xl text-2xl font-black text-white shadow-lg shadow-purple-900/50 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 uppercase tracking-wide`}
              >
                ¡A Jugar! <Play size={28} fill="white" />
              </button>
            </div>
          )}

          {/* --- PANTALLA: CATEGORÍAS (MODIFICADA: 1 COLUMNA, LETRA GRANDE) --- */}
          {gameStage === 'categories' && (
            <div className="flex-1 overflow-y-auto animate-fade-in pb-4">
              <div className="p-2 mb-4">
                  <p className="text-slate-400 font-bold text-center text-sm uppercase tracking-widest">Selecciona una categoría</p>
              </div>
              
              <div className="flex flex-col gap-3">
                  {CATEGORY_KEYS.map((cat, idx) => (
                    <button
                      key={cat}
                      onClick={() => selectCategory(cat)}
                      className={`${THEME.card} p-5 rounded-3xl border border-slate-700 hover:border-purple-500 hover:bg-slate-700 transition-all flex items-center gap-6 group shadow-lg relative overflow-hidden active:scale-[0.98]`}
                    >
                      {/* Fondo de color sutil */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${idx % 2 === 0 ? THEME.primary : THEME.secondary}`}></div>
                      
                      {/* Icono con fondo */}
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
                  
                  <button
                      onClick={() => selectCategory("Todas las anteriores")}
                      className={`mt-4 p-6 ${THEME.secondary} rounded-3xl text-slate-900 font-black hover:brightness-110 transition-all text-center flex items-center justify-center gap-4 uppercase tracking-wider text-xl shadow-xl active:scale-[0.98]`}
                    >
                      <Layers size={32} />
                      Mezclar Todo
                  </button>
              </div>
            </div>
          )}

          {/* --- PANTALLA: CUENTA REGRESIVA (NUEVA) --- */}
          {gameStage === 'countdown' && (
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center relative">
               {/* Decoración pulsante detrás del número */}
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

          {/* --- PANTALLA: CORTINA (PASS & PLAY) --- */}
          {gameStage === 'passAndPlay' && (
            <div className={`absolute inset-0 z-50 ${THEME.bg} flex flex-col`}>
              
              {/* FONDO (LO QUE SE VE AL LEVANTAR) */}
              <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-slate-800 m-4 rounded-[3rem] border border-slate-700 shadow-2xl relative overflow-hidden`}>
                <div className={`absolute top-0 w-full h-full opacity-10 ${playerRoles[currentPlayerIndex] ? 'bg-red-600' : 'bg-green-600'} blur-3xl`}></div>

                <div className="relative z-10">
                  {playerRoles[currentPlayerIndex] ? (
                      // Vista del Chamuyero
                      <div className="space-y-6 flex flex-col items-center animate-fade-in">
                      <div className="w-40 h-40 bg-red-600/20 rounded-full flex items-center justify-center border-4 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.4)] animate-pulse">
                          <UserX size={80} className="text-red-500" />
                      </div>
                      <div>
                          <h2 className="text-4xl font-black text-red-500 uppercase tracking-tighter">Eres el Chamuyero</h2>
                      </div>
                      <div className="bg-red-900/30 p-4 rounded-xl border border-red-800/50">
                          <p className="text-red-200 font-semibold text-lg">
                          🤫 ¡Shhh! Inventa algo. <br/> Engaña a todos.
                          </p>
                      </div>
                      </div>
                  ) : (
                      // Vista del Inocente
                      <div className="space-y-6 w-full animate-fade-in">
                      <div className={`w-32 h-32 mx-auto ${THEME.primary} bg-opacity-20 rounded-full flex items-center justify-center border-4 border-purple-500 shadow-[0_0_50px_rgba(139,92,246,0.3)]`}>
                          <Smile size={64} className="text-purple-400" />
                      </div>
                      <div>
                          <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">La palabra es</h2>
                          <div className={`mt-4 text-4xl font-black text-slate-900 ${THEME.secondary} px-6 py-6 rounded-2xl shadow-lg transform -rotate-1`}>
                              {currentWord}
                          </div>
                      </div>
                      <div className="inline-block bg-slate-900/50 border border-slate-700 px-4 py-1 rounded-full font-bold text-sm text-slate-400">
                          {selectedCategory}
                      </div>
                      </div>
                  )}
                </div>
              </div>

              {/* BOTÓN SIGUIENTE */}
              <div className={`p-6 pt-0 ${THEME.bg} z-0`}>
                <button 
                    onClick={handleNextPlayer}
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl text-xl font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    {currentPlayerIndex < numPlayers - 1 ? 'Pasar al Siguiente' : '¡A Discutir!'} <ArrowRight size={28} strokeWidth={3} />
                </button>
              </div>

              {/* LA CORTINA DESLIZABLE */}
              <div 
                className={`absolute inset-0 ${THEME.bg} transition-transform duration-500 ease-in-out cursor-pointer flex flex-col items-center justify-center z-20 border-b-4 border-slate-700 ${isRevealed ? '-translate-y-full' : 'translate-y-0'}`}
                onClick={handleReveal}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                
                <div className="flex flex-col items-center space-y-6 p-8 w-full max-w-sm relative z-10">
                    <div className={`w-28 h-28 rounded-full ${THEME.card} flex items-center justify-center border-4 ${THEME.accentBorder} shadow-[0_0_40px_rgba(163,230,53,0.2)] animate-bounce`}>
                      <span className={`text-5xl font-black ${THEME.secondaryText}`}>{currentPlayerIndex + 1}</span>
                    </div>
                    
                    <div className="text-center">
                      <h2 className="text-4xl font-black text-white uppercase drop-shadow-md">Jugador {currentPlayerIndex + 1}</h2>
                      <div className="mt-6">
                          <p className={`text-white font-bold flex items-center justify-center gap-2 animate-pulse uppercase tracking-widest text-sm`}>
                              <ChevronUp strokeWidth={3} /> Desliza para ver <ChevronUp strokeWidth={3} />
                          </p>
                      </div>
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-center backdrop-blur-sm">
                      <p className="text-xs text-red-300 font-bold uppercase tracking-wide">
                          ⚠️ Protege tu pantalla
                      </p>
                    </div>
                </div>
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
                      <button 
                          onClick={startNewRound}
                          className={`w-full py-4 ${THEME.primary} ${THEME.primaryHover} rounded-2xl font-black text-white shadow-lg transition flex items-center justify-center gap-2 uppercase text-lg tracking-wide`}
                      >
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

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .animation-delay-2000 { animation-delay: 2s; }
          .countdown-anim {
             animation: pulse-scale 1s infinite;
          }
          @keyframes pulse-scale {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}