import { NextResponse } from "next/server";

// ============================================================
// DATE → PUZZLE MAP  (Feb 19 – Mar 31, 2026)
// One puzzle per day, in order, no repeats.
// ============================================================
const SCHEDULE = {
  "2026-02-19": "p001",
  "2026-02-20": "p002",
  "2026-02-21": "p003",
  "2026-02-22": "p004",
  "2026-02-23": "p005",
  "2026-02-24": "p006",
  "2026-02-25": "p007",
  "2026-02-26": "p008",
  "2026-02-27": "p009",
  "2026-02-28": "p010",
  "2026-03-01": "p011",
  "2026-03-02": "p012",
  "2026-03-03": "p013",
  "2026-03-04": "p014",
  "2026-03-05": "p015",
  "2026-03-06": "p016",
  "2026-03-07": "p017",
  "2026-03-08": "p018",
  "2026-03-09": "p019",
  "2026-03-10": "p020",
  "2026-03-11": "p021",
  "2026-03-12": "p022",
  "2026-03-13": "p023",
  "2026-03-14": "p024",
  "2026-03-15": "p025",
  "2026-03-16": "p026",
  "2026-03-17": "p027",
  "2026-03-18": "p028",
  "2026-03-19": "p029",
  "2026-03-20": "p030",
  "2026-03-21": "p031",
  "2026-03-22": "p032",
  "2026-03-23": "p033",
  "2026-03-24": "p034",
  "2026-03-25": "p035",
  "2026-03-26": "p036",
  "2026-03-27": "p037",
  "2026-03-28": "p038",
  "2026-03-29": "p039",
  "2026-03-30": "p040",
  "2026-03-31": "p041",
};

// ============================================================
// PUZZLE LIBRARY — 41 sets
// Events in each puzzle are stored oldest→newest (correct order).
// The route shuffles them before sending to the player.
// ============================================================
const PUZZLES = {

  p001: { // Feb 19 — Ancient Wonders
    events: [
      { id: 1, title: "The Great Pyramid of Giza is completed", hint: "Giza, Egypt", year: -2560 },
      { id: 2, title: "Construction of the Parthenon begins", hint: "Athens, Greece", year: -447 },
      { id: 3, title: "The Library of Alexandria burns", hint: "Alexandria, Egypt", year: -48 },
      { id: 4, title: "The Roman Colosseum is completed", hint: "Rome, Italy", year: 80 },
      { id: 5, title: "Machu Picchu is built by the Inca", hint: "Peru", year: 1450 },
      { id: 6, title: "The Taj Mahal is completed", hint: "Agra, India", year: 1653 },
      { id: 7, title: "The Eiffel Tower opens to the public", hint: "Paris, France", year: 1889 },
    ],
  },

  p002: { // Feb 20 — Revolutions & Republics
    events: [
      { id: 1, title: "Magna Carta is signed by King John", hint: "Runnymede, England", year: 1215 },
      { id: 2, title: "The Gutenberg Bible is printed", hint: "Mainz, Germany", year: 1455 },
      { id: 3, title: "The American Declaration of Independence is signed", hint: "Philadelphia, USA", year: 1776 },
      { id: 4, title: "The French Revolution begins", hint: "Paris, France", year: 1789 },
      { id: 5, title: "Napoleon is exiled to Saint Helena", hint: "South Atlantic Ocean", year: 1815 },
      { id: 6, title: "Karl Marx publishes The Communist Manifesto", hint: "London, England", year: 1848 },
      { id: 7, title: "The Russian Revolution begins", hint: "Petrograd, Russia", year: 1917 },
    ],
  },

  p003: { // Feb 21 — Space Race
    events: [
      { id: 1, title: "World War II ends with Japan's surrender", hint: "Tokyo Bay, Japan", year: 1945 },
      { id: 2, title: "Sputnik 1 becomes the first satellite in orbit", hint: "Soviet Union", year: 1957 },
      { id: 3, title: "Yuri Gagarin becomes the first human in space", hint: "Baikonur, Kazakhstan", year: 1961 },
      { id: 4, title: "Neil Armstrong walks on the Moon", hint: "Sea of Tranquility", year: 1969 },
      { id: 5, title: "The Voyager 1 probe is launched", hint: "Cape Canaveral, USA", year: 1977 },
      { id: 6, title: "The Hubble Space Telescope is launched", hint: "Low Earth Orbit", year: 1990 },
      { id: 7, title: "The International Space Station is completed", hint: "Low Earth Orbit", year: 2011 },
    ],
  },

  p004: { // Feb 22 — Explorers & Discoveries
    events: [
      { id: 1, title: "Leif Erikson reaches North America", hint: "Newfoundland, Canada", year: 1000 },
      { id: 2, title: "Marco Polo arrives at the court of Kublai Khan", hint: "China", year: 1275 },
      { id: 3, title: "Columbus reaches the Americas", hint: "San Salvador, Bahamas", year: 1492 },
      { id: 4, title: "Vasco da Gama reaches India by sea", hint: "Calicut, India", year: 1498 },
      { id: 5, title: "Magellan's expedition completes the first circumnavigation", hint: "Seville, Spain", year: 1522 },
      { id: 6, title: "James Cook maps the east coast of Australia", hint: "Botany Bay, Australia", year: 1770 },
      { id: 7, title: "Roald Amundsen reaches the South Pole", hint: "Antarctica", year: 1911 },
    ],
  },

  p005: { // Feb 23 — Science Breakthroughs
    events: [
      { id: 1, title: "Galileo confirms the Earth orbits the Sun", hint: "Florence, Italy", year: 1610 },
      { id: 2, title: "Isaac Newton publishes his laws of gravity", hint: "Cambridge, England", year: 1687 },
      { id: 3, title: "Edward Jenner invents the smallpox vaccine", hint: "Gloucestershire, England", year: 1796 },
      { id: 4, title: "Charles Darwin publishes On the Origin of Species", hint: "London, England", year: 1859 },
      { id: 5, title: "Marie Curie discovers radium", hint: "Paris, France", year: 1898 },
      { id: 6, title: "Albert Einstein publishes the Theory of Relativity", hint: "Bern, Switzerland", year: 1905 },
      { id: 7, title: "Watson and Crick discover the structure of DNA", hint: "Cambridge, England", year: 1953 },
    ],
  },

  p006: { // Feb 24 — Wars That Changed the World
    events: [
      { id: 1, title: "The Battle of Marathon - Greeks defeat Persia", hint: "Marathon, Greece", year: -490 },
      { id: 2, title: "The Battle of Hastings - William the Conqueror wins England", hint: "Hastings, England", year: 1066 },
      { id: 3, title: "The Hundred Years War begins between England and France", hint: "Western Europe", year: 1337 },
      { id: 4, title: "The Battle of Waterloo ends Napoleon's rule", hint: "Waterloo, Belgium", year: 1815 },
      { id: 5, title: "World War I begins", hint: "Sarajevo, Bosnia", year: 1914 },
      { id: 6, title: "D-Day landings at Normandy", hint: "Normandy, France", year: 1944 },
      { id: 7, title: "The Korean War armistice is signed", hint: "Panmunjom, Korea", year: 1953 },
    ],
  },

  p007: { // Feb 25 — Inventions That Changed Everything
    events: [
      { id: 1, title: "Johannes Gutenberg invents the printing press", hint: "Mainz, Germany", year: 1440 },
      { id: 2, title: "James Watt patents the steam engine", hint: "Birmingham, England", year: 1769 },
      { id: 3, title: "Alexander Graham Bell makes the first telephone call", hint: "Boston, USA", year: 1876 },
      { id: 4, title: "Thomas Edison invents the practical light bulb", hint: "Menlo Park, USA", year: 1879 },
      { id: 5, title: "The Wright brothers make their first powered flight", hint: "Kitty Hawk, USA", year: 1903 },
      { id: 6, title: "The first commercial television broadcast takes place", hint: "New York, USA", year: 1941 },
      { id: 7, title: "Tim Berners-Lee invents the World Wide Web", hint: "CERN, Switzerland", year: 1989 },
    ],
  },

  p008: { // Feb 26 — Empires Rise and Fall
    events: [
      { id: 1, title: "Alexander the Great begins his conquest of Persia", hint: "Macedonia, Greece", year: -334 },
      { id: 2, title: "Julius Caesar is assassinated", hint: "Rome, Italy", year: -44 },
      { id: 3, title: "The Fall of Rome to the Visigoths", hint: "Rome, Italy", year: 410 },
      { id: 4, title: "Genghis Khan unifies the Mongol tribes", hint: "Central Asia", year: 1206 },
      { id: 5, title: "The Ottoman Empire conquers Constantinople", hint: "Constantinople", year: 1453 },
      { id: 6, title: "The British Empire reaches its peak", hint: "Global", year: 1922 },
      { id: 7, title: "The Soviet Union officially dissolves", hint: "Moscow, Russia", year: 1991 },
    ],
  },

  p009: { // Feb 27 — Civil Rights Milestones
    events: [
      { id: 1, title: "The Emancipation Proclamation is signed by Lincoln", hint: "Washington D.C., USA", year: 1863 },
      { id: 2, title: "Women gain the right to vote in New Zealand - a world first", hint: "New Zealand", year: 1893 },
      { id: 3, title: "Gandhi leads the Salt March in India", hint: "Gujarat, India", year: 1930 },
      { id: 4, title: "Rosa Parks refuses to give up her bus seat", hint: "Montgomery, USA", year: 1955 },
      { id: 5, title: "Martin Luther King Jr. delivers 'I Have a Dream'", hint: "Washington D.C., USA", year: 1963 },
      { id: 6, title: "Nelson Mandela is released from prison", hint: "Cape Town, South Africa", year: 1990 },
      { id: 7, title: "South Africa holds its first democratic election", hint: "South Africa", year: 1994 },
    ],
  },

  p010: { // Feb 28 — The Digital Age
    events: [
      { id: 1, title: "Alan Turing publishes his theory of computation", hint: "Cambridge, England", year: 1936 },
      { id: 2, title: "The first electronic computer ENIAC is completed", hint: "Philadelphia, USA", year: 1945 },
      { id: 3, title: "Intel releases the first commercial microprocessor", hint: "Silicon Valley, USA", year: 1971 },
      { id: 4, title: "Apple introduces the first Macintosh computer", hint: "Cupertino, USA", year: 1984 },
      { id: 5, title: "The World Wide Web opens to the public", hint: "CERN, Switzerland", year: 1991 },
      { id: 6, title: "Google is founded in a garage", hint: "Menlo Park, USA", year: 1998 },
      { id: 7, title: "Apple launches the first iPhone", hint: "San Francisco, USA", year: 2007 },
    ],
  },

  p011: { // Mar 01 — Plagues & Pandemics
    events: [
      { id: 1, title: "The Plague of Athens kills a quarter of the population", hint: "Athens, Greece", year: -430 },
      { id: 2, title: "The Black Death arrives in Europe", hint: "Sicily, Italy", year: 1347 },
      { id: 3, title: "The Great Plague of London kills 100,000", hint: "London, England", year: 1665 },
      { id: 4, title: "A cholera pandemic sweeps across Europe and America", hint: "Global", year: 1832 },
      { id: 5, title: "The Spanish Flu pandemic begins", hint: "Kansas, USA", year: 1918 },
      { id: 6, title: "HIV/AIDS is officially identified", hint: "Atlanta, USA", year: 1981 },
      { id: 7, title: "COVID-19 is declared a global pandemic", hint: "Geneva, Switzerland", year: 2020 },
    ],
  },

  p012: { // Mar 02 — Art & Culture
    events: [
      { id: 1, title: "Leonardo da Vinci completes the Mona Lisa", hint: "Florence, Italy", year: 1506 },
      { id: 2, title: "Shakespeare's Globe Theatre opens", hint: "London, England", year: 1599 },
      { id: 3, title: "Beethoven premieres his Ninth Symphony while completely deaf", hint: "Vienna, Austria", year: 1824 },
      { id: 4, title: "Picasso and Braque launch Cubism", hint: "Paris, France", year: 1907 },
      { id: 5, title: "The first Academy Awards ceremony is held", hint: "Hollywood, USA", year: 1929 },
      { id: 6, title: "The Beatles release their first album", hint: "London, England", year: 1963 },
      { id: 7, title: "The first Harry Potter book is published", hint: "London, England", year: 1997 },
    ],
  },

  p013: { // Mar 03 — Natural Disasters
    events: [
      { id: 1, title: "Mount Vesuvius erupts, destroying Pompeii", hint: "Naples, Italy", year: 79 },
      { id: 2, title: "The Great Fire of London destroys 13,000 homes", hint: "London, England", year: 1666 },
      { id: 3, title: "The Lisbon earthquake kills 30,000 people", hint: "Lisbon, Portugal", year: 1755 },
      { id: 4, title: "The Krakatoa eruption is heard 4,800km away", hint: "Sunda Strait, Indonesia", year: 1883 },
      { id: 5, title: "The San Francisco earthquake and fire kills 3,000", hint: "San Francisco, USA", year: 1906 },
      { id: 6, title: "The Indian Ocean tsunami kills 230,000 people", hint: "Indian Ocean", year: 2004 },
      { id: 7, title: "The Fukushima nuclear disaster follows a tsunami", hint: "Fukushima, Japan", year: 2011 },
    ],
  },

  p014: { // Mar 04 — Leaders & Power
    events: [
      { id: 1, title: "Cleopatra becomes Queen of Egypt", hint: "Alexandria, Egypt", year: -51 },
      { id: 2, title: "Charlemagne is crowned Holy Roman Emperor", hint: "Rome, Italy", year: 800 },
      { id: 3, title: "Queen Elizabeth I takes the throne of England", hint: "London, England", year: 1558 },
      { id: 4, title: "Catherine the Great becomes Empress of Russia", hint: "Saint Petersburg, Russia", year: 1762 },
      { id: 5, title: "Abraham Lincoln is elected President of the USA", hint: "Washington D.C., USA", year: 1860 },
      { id: 6, title: "Adolf Hitler becomes Chancellor of Germany", hint: "Berlin, Germany", year: 1933 },
      { id: 7, title: "Barack Obama becomes the first Black US President", hint: "Washington D.C., USA", year: 2009 },
    ],
  },

  p015: { // Mar 05 — Sports Legends
    events: [
      { id: 1, title: "The first modern Olympic Games are held", hint: "Athens, Greece", year: 1896 },
      { id: 2, title: "Roger Bannister breaks the 4-minute mile barrier", hint: "Oxford, England", year: 1954 },
      { id: 3, title: "Pelé scores his first World Cup goal at age 17", hint: "Stockholm, Sweden", year: 1958 },
      { id: 4, title: "Muhammad Ali defeats George Foreman in the Rumble in the Jungle", hint: "Kinshasa, Zaire", year: 1974 },
      { id: 5, title: "Michael Jordan leads the Bulls to their first NBA championship", hint: "Chicago, USA", year: 1991 },
      { id: 6, title: "Tiger Woods wins his first Masters at age 21", hint: "Augusta, USA", year: 1997 },
      { id: 7, title: "Usain Bolt sets the 100m world record at 9.58 seconds", hint: "Berlin, Germany", year: 2009 },
    ],
  },

  p016: { // Mar 06 — The Cold War
    events: [
      { id: 1, title: "The Iron Curtain speech divides East and West", hint: "Fulton, Missouri, USA", year: 1946 },
      { id: 2, title: "The Berlin Airlift begins to supply West Berlin", hint: "Berlin, Germany", year: 1948 },
      { id: 3, title: "The Korean War begins", hint: "Korean Peninsula", year: 1950 },
      { id: 4, title: "The Cuban Missile Crisis brings the world to the brink", hint: "Cuba", year: 1962 },
      { id: 5, title: "The Vietnam War ends with the fall of Saigon", hint: "Saigon, Vietnam", year: 1975 },
      { id: 6, title: "The Berlin Wall falls", hint: "Berlin, Germany", year: 1989 },
      { id: 7, title: "The Soviet Union dissolves into 15 countries", hint: "Moscow, Russia", year: 1991 },
    ],
  },

  p017: { // Mar 07 — Medicine Milestones
    events: [
      { id: 1, title: "William Harvey discovers blood circulation", hint: "London, England", year: 1628 },
      { id: 2, title: "Louis Pasteur proves germ theory", hint: "Paris, France", year: 1857 },
      { id: 3, title: "Wilhelm Roentgen discovers X-rays", hint: "Wurzburg, Germany", year: 1895 },
      { id: 4, title: "Alexander Fleming discovers penicillin", hint: "London, England", year: 1928 },
      { id: 5, title: "Jonas Salk develops the polio vaccine", hint: "Pittsburgh, USA", year: 1952 },
      { id: 6, title: "The first successful heart transplant is performed", hint: "Cape Town, South Africa", year: 1967 },
      { id: 7, title: "The Human Genome Project is completed", hint: "Washington D.C., USA", year: 2003 },
    ],
  },

  p018: { // Mar 08 — The Americas
    events: [
      { id: 1, title: "The Aztec Empire is founded at Tenochtitlan", hint: "Mexico", year: 1325 },
      { id: 2, title: "Hernan Cortes conquers the Aztec Empire", hint: "Tenochtitlan, Mexico", year: 1521 },
      { id: 3, title: "The Boston Tea Party ignites the American Revolution", hint: "Boston, USA", year: 1773 },
      { id: 4, title: "Simon Bolivar liberates Venezuela from Spain", hint: "Caracas, Venezuela", year: 1821 },
      { id: 5, title: "The Panama Canal opens", hint: "Panama", year: 1914 },
      { id: 6, title: "Fidel Castro takes power in Cuba", hint: "Havana, Cuba", year: 1959 },
      { id: 7, title: "The 9/11 attacks on the United States", hint: "New York & Washington D.C., USA", year: 2001 },
    ],
  },

  p019: { // Mar 09 — Asia Rising
    events: [
      { id: 1, title: "The Great Wall of China construction begins", hint: "Northern China", year: -221 },
      { id: 2, title: "Genghis Khan conquers Beijing", hint: "Beijing, China", year: 1215 },
      { id: 3, title: "The Meiji Restoration modernizes Japan", hint: "Tokyo, Japan", year: 1868 },
      { id: 4, title: "Japan attacks Pearl Harbor", hint: "Hawaii, USA", year: 1941 },
      { id: 5, title: "India and Pakistan gain independence from Britain", hint: "South Asia", year: 1947 },
      { id: 6, title: "Mao Zedong establishes the People's Republic of China", hint: "Beijing, China", year: 1949 },
      { id: 7, title: "China surpasses Japan as the world's second-largest economy", hint: "Beijing, China", year: 2010 },
    ],
  },

  p020: { // Mar 10 — The Environment
    events: [
      { id: 1, title: "John Muir founds the Sierra Club", hint: "San Francisco, USA", year: 1892 },
      { id: 2, title: "The Dust Bowl devastates the American Great Plains", hint: "Great Plains, USA", year: 1930 },
      { id: 3, title: "Rachel Carson publishes Silent Spring, launching environmentalism", hint: "Boston, USA", year: 1962 },
      { id: 4, title: "The first Earth Day is celebrated", hint: "Global", year: 1970 },
      { id: 5, title: "The Chernobyl nuclear disaster occurs", hint: "Chernobyl, Ukraine", year: 1986 },
      { id: 6, title: "The Kyoto Protocol on climate change is signed", hint: "Kyoto, Japan", year: 1997 },
      { id: 7, title: "Greta Thunberg starts her school strike for climate", hint: "Stockholm, Sweden", year: 2018 },
    ],
  },

  p021: { // Mar 11 — Communication Revolution
    events: [
      { id: 1, title: "The first postage stamp, the Penny Black, is issued", hint: "London, England", year: 1840 },
      { id: 2, title: "Samuel Morse sends the first telegraph message", hint: "Washington D.C., USA", year: 1844 },
      { id: 3, title: "Marconi sends the first transatlantic radio signal", hint: "Newfoundland, Canada", year: 1901 },
      { id: 4, title: "The first transatlantic telephone cable is laid", hint: "Atlantic Ocean", year: 1956 },
      { id: 5, title: "Motorola introduces the first commercial mobile phone", hint: "New York, USA", year: 1983 },
      { id: 6, title: "Twitter launches and changes public discourse", hint: "San Francisco, USA", year: 2006 },
      { id: 7, title: "TikTok launches globally and transforms entertainment", hint: "Beijing, China", year: 2017 },
    ],
  },

  p022: { // Mar 12 — Flights of Fancy
    events: [
      { id: 1, title: "The Montgolfier brothers make the first hot air balloon flight", hint: "Paris, France", year: 1783 },
      { id: 2, title: "The Wright brothers achieve powered flight", hint: "Kitty Hawk, USA", year: 1903 },
      { id: 3, title: "Charles Lindbergh completes the first solo transatlantic flight", hint: "Paris, France", year: 1927 },
      { id: 4, title: "Amelia Earhart flies solo across the Atlantic", hint: "Northern Ireland", year: 1932 },
      { id: 5, title: "The first commercial jet airliner, the Comet, enters service", hint: "London, England", year: 1952 },
      { id: 6, title: "Concorde makes its first supersonic passenger flight", hint: "Paris to Rio", year: 1976 },
      { id: 7, title: "SpaceX lands the first reusable rocket booster", hint: "Cape Canaveral, USA", year: 2015 },
    ],
  },

  p023: { // Mar 13 — The Middle East
    events: [
      { id: 1, title: "Islam is founded by the Prophet Muhammad", hint: "Mecca, Arabia", year: 610 },
      { id: 2, title: "The First Crusade captures Jerusalem", hint: "Jerusalem", year: 1099 },
      { id: 3, title: "The State of Israel is declared", hint: "Tel Aviv, Israel", year: 1948 },
      { id: 4, title: "The Suez Crisis begins", hint: "Suez Canal, Egypt", year: 1956 },
      { id: 5, title: "The OPEC oil embargo begins", hint: "Vienna, Austria", year: 1973 },
      { id: 6, title: "Saddam Hussein invades Kuwait", hint: "Kuwait City, Kuwait", year: 1990 },
      { id: 7, title: "Arab Spring uprisings sweep across the Middle East", hint: "Tunisia & Egypt", year: 2010 },
    ],
  },

  p024: { // Mar 14 — Gold Rush & Economy
    events: [
      { id: 1, title: "The California Gold Rush begins", hint: "Sutter's Mill, California", year: 1848 },
      { id: 2, title: "The London Underground opens - the world's first metro", hint: "London, England", year: 1863 },
      { id: 3, title: "The first US transcontinental railroad is completed", hint: "Promontory Summit, Utah", year: 1869 },
      { id: 4, title: "The Wall Street Crash triggers the Great Depression", hint: "New York, USA", year: 1929 },
      { id: 5, title: "The Bretton Woods Agreement establishes the IMF and World Bank", hint: "New Hampshire, USA", year: 1944 },
      { id: 6, title: "China joins the World Trade Organization", hint: "Doha, Qatar", year: 2001 },
      { id: 7, title: "The global financial crisis collapses Lehman Brothers", hint: "New York, USA", year: 2008 },
    ],
  },

  p025: { // Mar 15 — African History
    events: [
      { id: 1, title: "The Kingdom of Mali reaches its peak under Mansa Musa", hint: "West Africa", year: 1324 },
      { id: 2, title: "The transatlantic slave trade begins", hint: "West Africa", year: 1526 },
      { id: 3, title: "The Berlin Conference divides Africa among European powers", hint: "Berlin, Germany", year: 1884 },
      { id: 4, title: "Ghana becomes the first sub-Saharan country to gain independence", hint: "Accra, Ghana", year: 1957 },
      { id: 5, title: "17 African nations gain independence in a single year", hint: "Africa", year: 1960 },
      { id: 6, title: "The Rwandan genocide kills 800,000 people in 100 days", hint: "Kigali, Rwanda", year: 1994 },
      { id: 7, title: "South Africa hosts the FIFA World Cup", hint: "Johannesburg, South Africa", year: 2010 },
    ],
  },

  p026: { // Mar 16 — Renaissance & Enlightenment
    events: [
      { id: 1, title: "Martin Luther sparks the Protestant Reformation", hint: "Wittenberg, Germany", year: 1517 },
      { id: 2, title: "Michelangelo completes the Sistine Chapel ceiling", hint: "Vatican City, Rome", year: 1512 },
      { id: 3, title: "Nicolaus Copernicus proposes the Earth orbits the Sun", hint: "Krakow, Poland", year: 1543 },
      { id: 4, title: "The first Encyclopedia is published in France", hint: "Paris, France", year: 1751 },
      { id: 5, title: "Jean-Jacques Rousseau publishes The Social Contract", hint: "Amsterdam", year: 1762 },
      { id: 6, title: "Mary Wollstonecraft publishes A Vindication of the Rights of Woman", hint: "London, England", year: 1792 },
      { id: 7, title: "The French Revolution spreads Enlightenment ideals globally", hint: "Paris, France", year: 1789 },
    ],
  },

  p027: { // Mar 17 — Nuclear Age
    events: [
      { id: 1, title: "Ernest Rutherford splits the atom for the first time", hint: "Cambridge, England", year: 1917 },
      { id: 2, title: "The Manhattan Project begins in secret", hint: "Los Alamos, USA", year: 1942 },
      { id: 3, title: "The USA drops atomic bombs on Hiroshima and Nagasaki", hint: "Japan", year: 1945 },
      { id: 4, title: "The Soviet Union tests its first nuclear bomb", hint: "Kazakhstan", year: 1949 },
      { id: 5, title: "The first nuclear power plant opens in the USSR", hint: "Obninsk, Russia", year: 1954 },
      { id: 6, title: "The Nuclear Non-Proliferation Treaty is signed", hint: "Washington D.C.", year: 1968 },
      { id: 7, title: "The Chernobyl nuclear disaster triggers global safety reform", hint: "Chernobyl, Ukraine", year: 1986 },
    ],
  },

  p028: { // Mar 18 — Food & Agriculture
    events: [
      { id: 1, title: "Humans first begin growing wheat and barley", hint: "Fertile Crescent, Middle East", year: -10000 },
      { id: 2, title: "The Irish Potato Famine begins, killing over a million", hint: "Ireland", year: 1845 },
      { id: 3, title: "Norman Borlaug launches the Green Revolution with new wheat strains", hint: "Mexico", year: 1944 },
      { id: 4, title: "McDonald's opens its first franchise restaurant", hint: "Phoenix, USA", year: 1953 },
      { id: 5, title: "The first genetically modified food crop is approved", hint: "Washington D.C., USA", year: 1994 },
      { id: 6, title: "The global food crisis spikes prices and triggers riots", hint: "Global", year: 2008 },
      { id: 7, title: "Impossible Foods launches its plant-based burger", hint: "Redwood City, USA", year: 2016 },
    ],
  },

  p029: { // Mar 19 — Fashion & Identity
    events: [
      { id: 1, title: "Levi Strauss & Co. introduces the first blue jeans", hint: "San Francisco, USA", year: 1873 },
      { id: 2, title: "Coco Chanel launches her iconic No. 5 perfume", hint: "Paris, France", year: 1921 },
      { id: 3, title: "Christian Dior unveils the 'New Look' after World War II", hint: "Paris, France", year: 1947 },
      { id: 4, title: "Mary Quant popularizes the miniskirt in London", hint: "London, England", year: 1965 },
      { id: 5, title: "Nike launches the Air Jordan sneaker with Michael Jordan", hint: "Portland, USA", year: 1984 },
      { id: 6, title: "McQueen's Highland Rape collection shocks London Fashion Week", hint: "London, England", year: 1995 },
      { id: 7, title: "Virgil Abloh becomes the first Black artistic director at Louis Vuitton", hint: "Paris, France", year: 2018 },
    ],
  },

  p030: { // Mar 20 — Music & Sound
    events: [
      { id: 1, title: "Bach composes the Brandenburg Concertos", hint: "Kothen, Germany", year: 1721 },
      { id: 2, title: "Thomas Edison records sound for the first time", hint: "Menlo Park, USA", year: 1877 },
      { id: 3, title: "Robert Johnson records his legendary blues sessions", hint: "San Antonio, USA", year: 1936 },
      { id: 4, title: "Elvis Presley releases his first single, That's All Right", hint: "Memphis, USA", year: 1954 },
      { id: 5, title: "Woodstock festival takes place with 400,000 attendees", hint: "New York, USA", year: 1969 },
      { id: 6, title: "Michael Jackson releases Thriller - the best-selling album ever", hint: "Los Angeles, USA", year: 1982 },
      { id: 7, title: "Spotify launches, changing how music is consumed forever", hint: "Stockholm, Sweden", year: 2008 },
    ],
  },

  p031: { // Mar 21 — Women Who Changed History
    events: [
      { id: 1, title: "Joan of Arc leads France to victory at Orleans", hint: "Orleans, France", year: 1429 },
      { id: 2, title: "Florence Nightingale reforms nursing during the Crimean War", hint: "Scutari, Turkey", year: 1854 },
      { id: 3, title: "Marie Curie becomes the first woman to win a Nobel Prize", hint: "Stockholm, Sweden", year: 1903 },
      { id: 4, title: "Amelia Earhart becomes the first woman to fly solo across the Atlantic", hint: "Northern Ireland", year: 1932 },
      { id: 5, title: "Simone de Beauvoir publishes The Second Sex", hint: "Paris, France", year: 1949 },
      { id: 6, title: "Margaret Thatcher becomes the UK's first female Prime Minister", hint: "London, England", year: 1979 },
      { id: 7, title: "Malala Yousafzai becomes the youngest Nobel Peace Prize laureate", hint: "Oslo, Norway", year: 2014 },
    ],
  },

  p032: { // Mar 22 — Walls & Borders
    events: [
      { id: 1, title: "Hadrian's Wall is built across northern Britain", hint: "Northern England", year: 122 },
      { id: 2, title: "The Great Wall of China reaches its final form under the Ming Dynasty", hint: "Northern China", year: 1644 },
      { id: 3, title: "The Suez Canal opens, connecting the Mediterranean to the Red Sea", hint: "Egypt", year: 1869 },
      { id: 4, title: "The Berlin Wall is constructed overnight", hint: "Berlin, Germany", year: 1961 },
      { id: 5, title: "The Berlin Wall falls", hint: "Berlin, Germany", year: 1989 },
      { id: 6, title: "The Israeli West Bank barrier construction begins", hint: "West Bank", year: 2002 },
      { id: 7, title: "The UK votes to leave the European Union - Brexit", hint: "United Kingdom", year: 2016 },
    ],
  },

  p033: { // Mar 23 — Transport Revolution
    events: [
      { id: 1, title: "The first steam-powered locomotive is demonstrated", hint: "Wales, UK", year: 1804 },
      { id: 2, title: "Karl Benz patents the first true automobile", hint: "Mannheim, Germany", year: 1886 },
      { id: 3, title: "Henry Ford introduces the Model T and assembly line production", hint: "Detroit, USA", year: 1908 },
      { id: 4, title: "The first commercial jet airliner crosses the Atlantic", hint: "New York to London", year: 1958 },
      { id: 5, title: "The Boeing 747 Jumbo Jet makes its first commercial flight", hint: "New York, USA", year: 1970 },
      { id: 6, title: "The Channel Tunnel opens between England and France", hint: "English Channel", year: 1994 },
      { id: 7, title: "Tesla releases the first mass-market electric car, the Model 3", hint: "Fremont, USA", year: 2017 },
    ],
  },

  p034: { // Mar 24 — Spies & Secrets
    events: [
      { id: 1, title: "The Enigma machine is invented to encrypt military communications", hint: "Berlin, Germany", year: 1918 },
      { id: 2, title: "The Rosenbergs are executed for passing nuclear secrets to the Soviets", hint: "New York, USA", year: 1953 },
      { id: 3, title: "The CIA-backed Bay of Pigs invasion of Cuba fails spectacularly", hint: "Cuba", year: 1961 },
      { id: 4, title: "The Watergate scandal breaks in the USA", hint: "Washington D.C., USA", year: 1972 },
      { id: 5, title: "The KGB defector Oleg Gordievsky flees to Britain in a car boot", hint: "Finland", year: 1985 },
      { id: 6, title: "WikiLeaks publishes 250,000 classified US diplomatic cables", hint: "Global", year: 2010 },
      { id: 7, title: "Edward Snowden leaks NSA mass surveillance documents", hint: "Hong Kong", year: 2013 },
    ],
  },

  p035: { // Mar 25 — The Olympics
    events: [
      { id: 1, title: "The ancient Olympic Games begin in Greece", hint: "Olympia, Greece", year: -776 },
      { id: 2, title: "The first modern Olympic Games are held", hint: "Athens, Greece", year: 1896 },
      { id: 3, title: "Jesse Owens wins four gold medals at the Berlin Olympics, defying Hitler", hint: "Berlin, Germany", year: 1936 },
      { id: 4, title: "The Munich Olympics massacre shocks the world", hint: "Munich, Germany", year: 1972 },
      { id: 5, title: "The USA boycotts the Moscow Olympics", hint: "Moscow, Russia", year: 1980 },
      { id: 6, title: "Michael Phelps wins a record 8 gold medals in a single Games", hint: "Beijing, China", year: 2008 },
      { id: 7, title: "The Tokyo Olympics are held a year late due to COVID-19", hint: "Tokyo, Japan", year: 2021 },
    ],
  },

  p036: { // Mar 26 — Money & Trade
    events: [
      { id: 1, title: "The Silk Road trade route opens between China and the West", hint: "Central Asia", year: -130 },
      { id: 2, title: "The Bank of England is founded", hint: "London, England", year: 1694 },
      { id: 3, title: "Adam Smith publishes The Wealth of Nations", hint: "London, England", year: 1776 },
      { id: 4, title: "The New York Stock Exchange is founded", hint: "New York, USA", year: 1792 },
      { id: 5, title: "The Great Depression spreads from the USA across the world", hint: "Global", year: 1929 },
      { id: 6, title: "The European Union is formally established", hint: "Maastricht, Netherlands", year: 1993 },
      { id: 7, title: "Bitcoin is created by the anonymous Satoshi Nakamoto", hint: "Internet", year: 2009 },
    ],
  },

  p037: { // Mar 27 — Language & Writing
    events: [
      { id: 1, title: "The earliest known writing, cuneiform, appears in Mesopotamia", hint: "Sumer, Iraq", year: -3200 },
      { id: 2, title: "The Rosetta Stone is carved, key to decoding Egyptian hieroglyphs", hint: "Egypt", year: -196 },
      { id: 3, title: "The Gutenberg printing press revolutionizes the spread of knowledge", hint: "Mainz, Germany", year: 1440 },
      { id: 4, title: "Samuel Johnson publishes the first major English dictionary", hint: "London, England", year: 1755 },
      { id: 5, title: "The Esperanto language is published as a universal language", hint: "Warsaw, Poland", year: 1887 },
      { id: 6, title: "The Oxford English Dictionary is completed after 70 years of work", hint: "Oxford, England", year: 1928 },
      { id: 7, title: "Emoji become part of the Unicode standard", hint: "Mountain View, USA", year: 2010 },
    ],
  },

  p038: { // Mar 28 — Pirates & Outlaws
    events: [
      { id: 1, title: "The Viking age begins with raids on England", hint: "Lindisfarne, England", year: 793 },
      { id: 2, title: "Blackbeard the pirate is killed in battle off North Carolina", hint: "North Carolina, USA", year: 1718 },
      { id: 3, title: "Billy the Kid is shot dead by Sheriff Pat Garrett", hint: "New Mexico, USA", year: 1881 },
      { id: 4, title: "Bonnie and Clyde are ambushed and killed", hint: "Louisiana, USA", year: 1934 },
      { id: 5, title: "The Great Train Robbery nets over £2 million in England", hint: "Buckinghamshire, England", year: 1963 },
      { id: 6, title: "Pablo Escobar is shot dead on a rooftop in Medellin", hint: "Medellin, Colombia", year: 1993 },
      { id: 7, title: "The Silk Road dark web marketplace is shut down by the FBI", hint: "San Francisco, USA", year: 2013 },
    ],
  },

  p039: { // Mar 29 — Architecture & Cities
    events: [
      { id: 1, title: "The Colosseum in Rome is completed", hint: "Rome, Italy", year: 80 },
      { id: 2, title: "Notre-Dame Cathedral in Paris is completed", hint: "Paris, France", year: 1345 },
      { id: 3, title: "St. Peter's Basilica in Vatican City is completed", hint: "Vatican City", year: 1626 },
      { id: 4, title: "The Brooklyn Bridge opens in New York City", hint: "New York, USA", year: 1883 },
      { id: 5, title: "The Empire State Building opens as the world's tallest", hint: "New York, USA", year: 1931 },
      { id: 6, title: "The Sydney Opera House opens", hint: "Sydney, Australia", year: 1973 },
      { id: 7, title: "The Burj Khalifa opens as the world's tallest building", hint: "Dubai, UAE", year: 2010 },
    ],
  },

  p040: { // Mar 30 — Philosophy & Ideas
    events: [
      { id: 1, title: "Socrates is sentenced to death for corrupting the youth of Athens", hint: "Athens, Greece", year: -399 },
      { id: 2, title: "Confucius establishes his philosophy of ethics and social harmony", hint: "China", year: -500 },
      { id: 3, title: "Thomas Aquinas writes Summa Theologica", hint: "Naples, Italy", year: 1265 },
      { id: 4, title: "Rene Descartes publishes 'I think therefore I am'", hint: "Netherlands", year: 1637 },
      { id: 5, title: "John Locke publishes his theory of natural rights", hint: "London, England", year: 1689 },
      { id: 6, title: "Friedrich Nietzsche declares 'God is Dead'", hint: "Germany", year: 1882 },
      { id: 7, title: "Simone de Beauvoir publishes The Second Sex", hint: "Paris, France", year: 1949 },
    ],
  },

  p041: { // Mar 31 — The Internet Age
    events: [
      { id: 1, title: "ARPANET, the precursor to the internet, sends its first message", hint: "California, USA", year: 1969 },
      { id: 2, title: "The World Wide Web is invented by Tim Berners-Lee", hint: "CERN, Switzerland", year: 1989 },
      { id: 3, title: "Amazon launches as an online bookstore", hint: "Seattle, USA", year: 1994 },
      { id: 4, title: "Google launches and changes how we find information", hint: "Stanford, USA", year: 1998 },
      { id: 5, title: "Facebook launches from a Harvard dorm room", hint: "Cambridge, USA", year: 2004 },
      { id: 6, title: "YouTube launches and democratizes video", hint: "San Mateo, USA", year: 2005 },
      { id: 7, title: "ChatGPT launches, sparking a global AI revolution", hint: "San Francisco, USA", year: 2022 },
    ],
  },

};

// ============================================================
// SEEDED SHUFFLE — same shuffle for same date, every time
// ============================================================
function seededShuffle(arr, seed) {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function dateToSeed(dateStr) {
  return dateStr.split("-").reduce((acc, p) => acc * 100 + parseInt(p), 0);
}

// ============================================================
// ROUTE HANDLER
// ============================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let dateStr = searchParams.get("date");

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      dateStr = new Date().toLocaleDateString("en-CA");
    }

    const puzzleId = SCHEDULE[dateStr];
    if (!puzzleId || !PUZZLES[puzzleId]) {
      return NextResponse.json({ error: "No puzzle for this date" }, { status: 404 });
    }

    const puzzle = PUZZLES[puzzleId];
    const seed = dateToSeed(dateStr);

    // Shuffle events for this player/date
    const shuffledEvents = seededShuffle(puzzle.events, seed);

    // Correct answer order (sorted by year)
    const answerOrder = [...puzzle.events]
      .sort((a, b) => a.year - b.year)
      .map((e) => e.id);

    // Year labels
    const yearMap = {};
    puzzle.events.forEach((e) => {
      yearMap[e.id] = e.year < 0 ? `${Math.abs(e.year)} BC` : String(e.year);
    });

    return NextResponse.json(
      {
        puzzle: { id: puzzleId, date: dateStr, events: shuffledEvents },
        answerOrder,
        yearMap,
      },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } }
    );
  } catch (error) {
    console.error("Puzzle route error:", error);
    return NextResponse.json({ error: "Failed to load puzzle" }, { status: 500 });
  }
}
