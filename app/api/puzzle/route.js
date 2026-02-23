import { NextResponse } from "next/server";

// ============================================================
// EVENT POOL — 215 individual historical events
// Every day, 7 are picked at random (seeded by date).
// Events span all topics and eras so no day feels "themed."
// ============================================================
const EVENTS = [
  { id: 1,   title: "The Great Pyramid of Giza is completed",                        hint: "Giza, Egypt",                   year: -2560 },
  { id: 2,   title: "The Trojan War begins",                                         hint: "Troy, Anatolia",                 year: -1260 },
  { id: 3,   title: "The first Olympic Games are held in ancient Greece",             hint: "Olympia, Greece",                year: -776  },
  { id: 4,   title: "Rome is founded, according to Roman tradition",                  hint: "Rome, Italy",                    year: -753  },
  { id: 5,   title: "Confucius is born in China",                                    hint: "Lu, China",                      year: -551  },
  { id: 6,   title: "The Parthenon is completed in Athens",                          hint: "Athens, Greece",                 year: -432  },
  { id: 7,   title: "Alexander the Great conquers Persia",                           hint: "Persia",                         year: -330  },
  { id: 8,   title: "Julius Caesar is assassinated in the Senate",                   hint: "Rome, Italy",                    year: -44   },
  { id: 9,   title: "The Roman Colosseum is completed",                              hint: "Rome, Italy",                    year: 80    },
  { id: 10,  title: "Mount Vesuvius erupts, destroying Pompeii",                     hint: "Naples, Italy",                  year: 79    },
  { id: 11,  title: "Hadrian's Wall is built across northern Britain",               hint: "Northern England",               year: 122   },
  { id: 12,  title: "The fall of Rome to the Visigoths",                             hint: "Rome, Italy",                    year: 410   },
  { id: 13,  title: "The Prophet Muhammad founds Islam",                             hint: "Mecca, Arabia",                  year: 610   },
  { id: 14,  title: "The First Crusade captures Jerusalem",                          hint: "Jerusalem",                      year: 1099  },
  { id: 15,  title: "Genghis Khan unifies the Mongol tribes",                        hint: "Central Asia",                   year: 1206  },
  { id: 16,  title: "Magna Carta is signed by King John",                            hint: "Runnymede, England",             year: 1215  },
  { id: 17,  title: "The Black Death arrives in Europe",                             hint: "Sicily, Italy",                  year: 1347  },
  { id: 18,  title: "Joan of Arc leads France to victory at Orléans",               hint: "Orléans, France",                year: 1429  },
  { id: 19,  title: "The Ottoman Empire conquers Constantinople",                    hint: "Constantinople",                 year: 1453  },
  { id: 20,  title: "Johannes Gutenberg invents the printing press",                 hint: "Mainz, Germany",                 year: 1440  },
  { id: 21,  title: "Columbus reaches the Americas",                                 hint: "San Salvador, Bahamas",          year: 1492  },
  { id: 22,  title: "Vasco da Gama reaches India by sea",                            hint: "Calicut, India",                 year: 1498  },
  { id: 23,  title: "Michelangelo completes the Sistine Chapel ceiling",             hint: "Vatican City",                   year: 1512  },
  { id: 24,  title: "Martin Luther sparks the Protestant Reformation",               hint: "Wittenberg, Germany",            year: 1517  },
  { id: 25,  title: "Magellan's expedition completes the first circumnavigation",    hint: "Seville, Spain",                 year: 1522  },
  { id: 26,  title: "Copernicus proposes the Earth orbits the Sun",                  hint: "Krakow, Poland",                 year: 1543  },
  { id: 27,  title: "Shakespeare's Globe Theatre opens in London",                   hint: "London, England",                year: 1599  },
  { id: 28,  title: "Galileo confirms the Earth orbits the Sun",                     hint: "Florence, Italy",                year: 1610  },
  { id: 29,  title: "The Taj Mahal construction begins in India",                    hint: "Agra, India",                    year: 1632  },
  { id: 30,  title: "The Great Fire of London destroys the city",                    hint: "London, England",                year: 1666  },
  { id: 31,  title: "Isaac Newton publishes his laws of gravity",                    hint: "Cambridge, England",             year: 1687  },
  { id: 32,  title: "The Bank of England is founded",                                hint: "London, England",                year: 1694  },
  { id: 33,  title: "Peter the Great founds St. Petersburg",                         hint: "Russia",                         year: 1703  },
  { id: 34,  title: "Bach composes the Brandenburg Concertos",                       hint: "Köthen, Germany",                year: 1721  },
  { id: 35,  title: "The Montgolfier brothers make the first hot air balloon flight", hint: "Paris, France",                 year: 1783  },
  { id: 36,  title: "The American Declaration of Independence is signed",            hint: "Philadelphia, USA",              year: 1776  },
  { id: 37,  title: "Adam Smith publishes The Wealth of Nations",                    hint: "London, England",                year: 1776  },
  { id: 38,  title: "The Bastille is stormed, igniting the French Revolution",       hint: "Paris, France",                  year: 1789  },
  { id: 39,  title: "Edward Jenner invents the smallpox vaccine",                    hint: "Gloucestershire, England",       year: 1796  },
  { id: 40,  title: "Napoleon crowns himself Emperor of France",                     hint: "Paris, France",                  year: 1804  },
  { id: 41,  title: "The Battle of Waterloo ends Napoleon's rule",                   hint: "Waterloo, Belgium",              year: 1815  },
  { id: 42,  title: "Mary Shelley publishes Frankenstein",                           hint: "London, England",                year: 1818  },
  { id: 43,  title: "Beethoven premieres his Ninth Symphony while completely deaf",  hint: "Vienna, Austria",                year: 1824  },
  { id: 44,  title: "The first steam locomotive passenger railway opens",            hint: "Stockton, England",              year: 1825  },
  { id: 45,  title: "The first photograph is taken",                                 hint: "France",                         year: 1826  },
  { id: 46,  title: "Charles Darwin sets sail on the HMS Beagle",                   hint: "Plymouth, England",              year: 1831  },
  { id: 47,  title: "Samuel Morse sends the first telegraph message",                hint: "Washington D.C., USA",           year: 1844  },
  { id: 48,  title: "The California Gold Rush begins",                               hint: "Sutter's Mill, California",      year: 1848  },
  { id: 49,  title: "Karl Marx publishes The Communist Manifesto",                   hint: "London, England",                year: 1848  },
  { id: 50,  title: "The Great Exhibition opens in Crystal Palace",                  hint: "London, England",                year: 1851  },
  { id: 51,  title: "Charles Darwin publishes On the Origin of Species",             hint: "London, England",                year: 1859  },
  { id: 52,  title: "The Emancipation Proclamation is signed by Lincoln",            hint: "Washington D.C., USA",           year: 1863  },
  { id: 53,  title: "Abraham Lincoln is assassinated at the theatre",                hint: "Washington D.C., USA",           year: 1865  },
  { id: 54,  title: "The first US transcontinental railroad is completed",           hint: "Promontory Summit, Utah",        year: 1869  },
  { id: 55,  title: "Levi Strauss invents blue jeans",                               hint: "San Francisco, USA",             year: 1873  },
  { id: 56,  title: "Alexander Graham Bell makes the first telephone call",          hint: "Boston, USA",                    year: 1876  },
  { id: 57,  title: "Thomas Edison invents the practical light bulb",                hint: "Menlo Park, USA",                year: 1879  },
  { id: 58,  title: "The Berlin Conference divides Africa between European powers",  hint: "Berlin, Germany",                year: 1884  },
  { id: 59,  title: "Karl Benz patents the first true automobile",                   hint: "Mannheim, Germany",              year: 1886  },
  { id: 60,  title: "The Statue of Liberty is unveiled in New York",                 hint: "New York, USA",                  year: 1886  },
  { id: 61,  title: "The Eiffel Tower opens to the public",                          hint: "Paris, France",                  year: 1889  },
  { id: 62,  title: "The first modern Olympic Games are held",                       hint: "Athens, Greece",                 year: 1896  },
  { id: 63,  title: "Marie Curie discovers radium",                                  hint: "Paris, France",                  year: 1898  },
  { id: 64,  title: "The first Nobel Prizes are awarded",                            hint: "Stockholm, Sweden",              year: 1901  },
  { id: 65,  title: "Marconi sends the first transatlantic radio signal",            hint: "Newfoundland, Canada",           year: 1901  },
  { id: 66,  title: "The Wright brothers achieve powered flight",                    hint: "Kitty Hawk, USA",                year: 1903  },
  { id: 67,  title: "Albert Einstein publishes the Theory of Relativity",            hint: "Bern, Switzerland",              year: 1905  },
  { id: 68,  title: "The San Francisco earthquake and fire kills 3,000",             hint: "San Francisco, USA",             year: 1906  },
  { id: 69,  title: "The RMS Titanic sinks on its maiden voyage",                    hint: "North Atlantic Ocean",           year: 1912  },
  { id: 70,  title: "World War I begins",                                            hint: "Sarajevo, Bosnia",               year: 1914  },
  { id: 71,  title: "The Panama Canal opens",                                        hint: "Panama",                         year: 1914  },
  { id: 72,  title: "Roald Amundsen reaches the South Pole",                         hint: "Antarctica",                     year: 1911  },
  { id: 73,  title: "The Russian Revolution begins",                                 hint: "Petrograd, Russia",              year: 1917  },
  { id: 74,  title: "World War I ends with the Armistice",                           hint: "Compiègne, France",              year: 1918  },
  { id: 75,  title: "The Spanish Flu pandemic sweeps the world",                     hint: "Global",                         year: 1918  },
  { id: 76,  title: "Women gain the right to vote in the USA",                       hint: "Washington D.C., USA",           year: 1920  },
  { id: 77,  title: "Coco Chanel launches her iconic No. 5 perfume",                 hint: "Paris, France",                  year: 1921  },
  { id: 78,  title: "The BBC begins radio broadcasting",                             hint: "London, England",                year: 1922  },
  { id: 79,  title: "Howard Carter discovers Tutankhamun's tomb",                    hint: "Valley of the Kings, Egypt",     year: 1922  },
  { id: 80,  title: "Alexander Fleming discovers penicillin",                        hint: "London, England",                year: 1928  },
  { id: 81,  title: "The Wall Street Crash triggers the Great Depression",           hint: "New York, USA",                  year: 1929  },
  { id: 82,  title: "The first Academy Awards ceremony is held",                     hint: "Hollywood, USA",                 year: 1929  },
  { id: 83,  title: "Gandhi leads the Salt March in India",                          hint: "Gujarat, India",                 year: 1930  },
  { id: 84,  title: "Amelia Earhart becomes the first woman to fly solo across the Atlantic", hint: "Northern Ireland",      year: 1932  },
  { id: 85,  title: "Adolf Hitler becomes Chancellor of Germany",                    hint: "Berlin, Germany",                year: 1933  },
  { id: 86,  title: "Jesse Owens wins four gold medals at the Berlin Olympics",      hint: "Berlin, Germany",                year: 1936  },
  { id: 87,  title: "The Golden Gate Bridge opens in San Francisco",                 hint: "San Francisco, USA",             year: 1937  },
  { id: 88,  title: "World War II begins with Germany's invasion of Poland",         hint: "Poland",                         year: 1939  },
  { id: 89,  title: "The Battle of Britain takes place in the skies",                hint: "England",                        year: 1940  },
  { id: 90,  title: "Japan attacks Pearl Harbor, drawing the USA into WWII",         hint: "Hawaii, USA",                    year: 1941  },
  { id: 91,  title: "D-Day landings take place at Normandy",                         hint: "Normandy, France",               year: 1944  },
  { id: 92,  title: "The USA drops atomic bombs on Hiroshima and Nagasaki",          hint: "Japan",                          year: 1945  },
  { id: 93,  title: "World War II ends with Japan's surrender",                      hint: "Tokyo Bay, Japan",               year: 1945  },
  { id: 94,  title: "The United Nations is founded",                                 hint: "San Francisco, USA",             year: 1945  },
  { id: 95,  title: "India and Pakistan gain independence from Britain",              hint: "South Asia",                     year: 1947  },
  { id: 96,  title: "The State of Israel is declared",                               hint: "Tel Aviv, Israel",               year: 1948  },
  { id: 97,  title: "Mao Zedong establishes the People's Republic of China",         hint: "Beijing, China",                 year: 1949  },
  { id: 98,  title: "The Soviet Union tests its first nuclear bomb",                 hint: "Kazakhstan",                     year: 1949  },
  { id: 99,  title: "The Korean War begins",                                         hint: "Korean Peninsula",               year: 1950  },
  { id: 100, title: "The first commercial jet airliner enters service",              hint: "London, England",                year: 1952  },
  { id: 101, title: "Watson and Crick discover the structure of DNA",                hint: "Cambridge, England",             year: 1953  },
  { id: 102, title: "The first McDonald's franchise restaurant opens",               hint: "Phoenix, USA",                   year: 1953  },
  { id: 103, title: "Roger Bannister breaks the 4-minute mile",                      hint: "Oxford, England",                year: 1954  },
  { id: 104, title: "Elvis Presley releases his first single",                       hint: "Memphis, USA",                   year: 1954  },
  { id: 105, title: "Rosa Parks refuses to give up her bus seat",                    hint: "Montgomery, USA",                year: 1955  },
  { id: 106, title: "The Suez Crisis begins",                                        hint: "Suez Canal, Egypt",              year: 1956  },
  { id: 107, title: "The first transatlantic telephone cable is laid",               hint: "Atlantic Ocean",                 year: 1956  },
  { id: 108, title: "Sputnik 1 becomes the first satellite in orbit",                hint: "Soviet Union",                   year: 1957  },
  { id: 109, title: "Ghana becomes the first sub-Saharan country to gain independence", hint: "Accra, Ghana",               year: 1957  },
  { id: 110, title: "Pelé scores his first World Cup goal at age 17",                hint: "Stockholm, Sweden",              year: 1958  },
  { id: 111, title: "Fidel Castro takes power in Cuba",                              hint: "Havana, Cuba",                   year: 1959  },
  { id: 112, title: "The first contraceptive pill is approved in the USA",           hint: "Washington D.C., USA",           year: 1960  },
  { id: 113, title: "Yuri Gagarin becomes the first human in space",                 hint: "Baikonur, Kazakhstan",           year: 1961  },
  { id: 114, title: "The Berlin Wall is constructed overnight",                      hint: "Berlin, Germany",                year: 1961  },
  { id: 115, title: "The Cuban Missile Crisis brings the world to the brink",        hint: "Cuba",                           year: 1962  },
  { id: 116, title: "The Beatles release their first album",                         hint: "London, England",                year: 1963  },
  { id: 117, title: "President Kennedy is assassinated in Dallas",                   hint: "Dallas, USA",                    year: 1963  },
  { id: 118, title: "Martin Luther King Jr. delivers 'I Have a Dream'",              hint: "Washington D.C., USA",           year: 1963  },
  { id: 119, title: "Nelson Mandela is sentenced to life in prison",                 hint: "Pretoria, South Africa",         year: 1964  },
  { id: 120, title: "Che Guevara is captured and executed in Bolivia",               hint: "La Higuera, Bolivia",            year: 1967  },
  { id: 121, title: "The first human heart transplant is performed",                 hint: "Cape Town, South Africa",        year: 1967  },
  { id: 122, title: "Martin Luther King Jr. is assassinated in Memphis",             hint: "Memphis, USA",                   year: 1968  },
  { id: 123, title: "Neil Armstrong walks on the Moon",                              hint: "Sea of Tranquility",             year: 1969  },
  { id: 124, title: "Woodstock festival takes place in New York",                    hint: "New York, USA",                  year: 1969  },
  { id: 125, title: "The first Earth Day is celebrated",                             hint: "Global",                         year: 1970  },
  { id: 126, title: "Intel releases the first commercial microprocessor",            hint: "Silicon Valley, USA",            year: 1971  },
  { id: 127, title: "The Watergate scandal breaks in the USA",                       hint: "Washington D.C., USA",           year: 1972  },
  { id: 128, title: "Man lands on the Moon for the last time",                       hint: "Moon",                           year: 1972  },
  { id: 129, title: "Muhammad Ali defeats Foreman in the Rumble in the Jungle",      hint: "Kinshasa, Zaire",                year: 1974  },
  { id: 130, title: "Watergate tapes lead Nixon to resign the presidency",           hint: "Washington D.C., USA",           year: 1974  },
  { id: 131, title: "The Vietnam War ends with the fall of Saigon",                  hint: "Saigon, Vietnam",                year: 1975  },
  { id: 132, title: "Concorde makes its first supersonic passenger flight",          hint: "Paris to Rio",                   year: 1976  },
  { id: 133, title: "The Voyager 1 probe is launched toward deep space",             hint: "Cape Canaveral, USA",            year: 1977  },
  { id: 134, title: "The first Star Wars film is released",                          hint: "Hollywood, USA",                 year: 1977  },
  { id: 135, title: "The first personal computer, the Apple II, goes on sale",       hint: "Cupertino, USA",                 year: 1977  },
  { id: 136, title: "The Sony Walkman is released",                                  hint: "Tokyo, Japan",                   year: 1979  },
  { id: 137, title: "Margaret Thatcher becomes the UK's first female Prime Minister", hint: "London, England",               year: 1979  },
  { id: 138, title: "The Iran hostage crisis begins",                                hint: "Tehran, Iran",                   year: 1979  },
  { id: 139, title: "Pac-Man is released and becomes a global phenomenon",           hint: "Tokyo, Japan",                   year: 1980  },
  { id: 140, title: "The first Space Shuttle launch takes place",                    hint: "Cape Canaveral, USA",            year: 1981  },
  { id: 141, title: "HIV/AIDS is officially identified by scientists",               hint: "Atlanta, USA",                   year: 1981  },
  { id: 142, title: "Michael Jackson releases Thriller",                             hint: "Los Angeles, USA",               year: 1982  },
  { id: 143, title: "Motorola introduces the first commercial mobile phone",         hint: "New York, USA",                  year: 1983  },
  { id: 144, title: "Apple introduces the first Macintosh computer",                 hint: "Cupertino, USA",                 year: 1984  },
  { id: 145, title: "The Live Aid concert raises millions for famine relief",        hint: "London & Philadelphia",          year: 1985  },
  { id: 146, title: "The Space Shuttle Challenger explodes shortly after launch",    hint: "Cape Canaveral, USA",            year: 1986  },
  { id: 147, title: "The Chernobyl nuclear disaster occurs in Ukraine",              hint: "Chernobyl, Ukraine",             year: 1986  },
  { id: 148, title: "The Berlin Wall falls",                                         hint: "Berlin, Germany",                year: 1989  },
  { id: 149, title: "Tim Berners-Lee invents the World Wide Web",                    hint: "CERN, Switzerland",              year: 1989  },
  { id: 150, title: "The Hubble Space Telescope is launched into orbit",             hint: "Low Earth Orbit",                year: 1990  },
  { id: 151, title: "Nelson Mandela is released from prison after 27 years",         hint: "Cape Town, South Africa",        year: 1990  },
  { id: 152, title: "The Gulf War begins with Iraq's invasion of Kuwait",            hint: "Kuwait",                         year: 1990  },
  { id: 153, title: "The World Wide Web opens to the public",                        hint: "CERN, Switzerland",              year: 1991  },
  { id: 154, title: "The Soviet Union officially dissolves",                         hint: "Moscow, Russia",                 year: 1991  },
  { id: 155, title: "The first text message is sent",                                hint: "Newbury, England",               year: 1992  },
  { id: 156, title: "The Maastricht Treaty establishes the European Union",          hint: "Maastricht, Netherlands",        year: 1993  },
  { id: 157, title: "The Channel Tunnel opens between England and France",           hint: "English Channel",                year: 1994  },
  { id: 158, title: "South Africa holds its first democratic election",              hint: "South Africa",                   year: 1994  },
  { id: 159, title: "The Rwandan genocide kills 800,000 in 100 days",                hint: "Kigali, Rwanda",                 year: 1994  },
  { id: 160, title: "Amazon launches as an online bookstore",                        hint: "Seattle, USA",                   year: 1994  },
  { id: 161, title: "Nelson Mandela becomes the first Black President of South Africa", hint: "Pretoria, South Africa",      year: 1994  },
  { id: 162, title: "Dolly the sheep becomes the first cloned mammal",               hint: "Edinburgh, Scotland",            year: 1996  },
  { id: 163, title: "The Kyoto Protocol on climate change is signed",                hint: "Kyoto, Japan",                   year: 1997  },
  { id: 164, title: "The first Harry Potter book is published",                      hint: "London, England",                year: 1997  },
  { id: 165, title: "Princess Diana is killed in a car crash in Paris",              hint: "Paris, France",                  year: 1997  },
  { id: 166, title: "Google is founded in a garage",                                 hint: "Menlo Park, USA",                year: 1998  },
  { id: 167, title: "The Euro currency is introduced in Europe",                     hint: "European Union",                 year: 1999  },
  { id: 168, title: "The 9/11 attacks change the world",                             hint: "New York & Washington D.C.",     year: 2001  },
  { id: 169, title: "Wikipedia launches and changes how we access knowledge",        hint: "Internet",                       year: 2001  },
  { id: 170, title: "Concorde makes its final commercial flight",                    hint: "London, England",                year: 2003  },
  { id: 171, title: "Facebook launches from a Harvard dorm room",                    hint: "Cambridge, USA",                 year: 2004  },
  { id: 172, title: "The Indian Ocean tsunami kills 230,000 people",                 hint: "Indian Ocean",                   year: 2004  },
  { id: 173, title: "YouTube launches and democratises online video",                hint: "San Mateo, USA",                 year: 2005  },
  { id: 174, title: "Twitter launches and changes public discourse",                 hint: "San Francisco, USA",             year: 2006  },
  { id: 175, title: "Apple launches the first iPhone",                               hint: "San Francisco, USA",             year: 2007  },
  { id: 176, title: "The global financial crisis collapses Lehman Brothers",         hint: "New York, USA",                  year: 2008  },
  { id: 177, title: "Spotify launches, forever changing how music is consumed",      hint: "Stockholm, Sweden",              year: 2008  },
  { id: 178, title: "The Large Hadron Collider is switched on at CERN",              hint: "Geneva, Switzerland",            year: 2008  },
  { id: 179, title: "Barack Obama becomes the first Black US President",             hint: "Washington D.C., USA",           year: 2009  },
  { id: 180, title: "Usain Bolt sets the 100m world record at 9.58 seconds",         hint: "Berlin, Germany",                year: 2009  },
  { id: 181, title: "Bitcoin is created by the anonymous Satoshi Nakamoto",          hint: "Internet",                       year: 2009  },
  { id: 182, title: "The Arab Spring uprisings sweep across the Middle East",        hint: "Tunisia & Egypt",                year: 2010  },
  { id: 183, title: "A massive earthquake devastates Haiti",                         hint: "Port-au-Prince, Haiti",          year: 2010  },
  { id: 184, title: "Osama Bin Laden is killed by US special forces",                hint: "Abbottabad, Pakistan",           year: 2011  },
  { id: 185, title: "The Fukushima nuclear disaster follows a tsunami in Japan",     hint: "Fukushima, Japan",               year: 2011  },
  { id: 186, title: "Nelson Mandela dies at the age of 95",                          hint: "Johannesburg, South Africa",     year: 2013  },
  { id: 187, title: "Edward Snowden leaks NSA mass surveillance documents",          hint: "Hong Kong",                      year: 2013  },
  { id: 188, title: "Malala Yousafzai becomes the youngest Nobel Peace Prize winner", hint: "Oslo, Norway",                  year: 2014  },
  { id: 189, title: "SpaceX lands the first reusable rocket booster",                hint: "Cape Canaveral, USA",            year: 2015  },
  { id: 190, title: "The Paris Agreement on climate change is signed",               hint: "Paris, France",                  year: 2015  },
  { id: 191, title: "The UK votes to leave the European Union — Brexit",             hint: "United Kingdom",                 year: 2016  },
  { id: 192, title: "Donald Trump is elected President of the USA",                  hint: "Washington D.C., USA",           year: 2016  },
  { id: 193, title: "The #MeToo movement goes global",                               hint: "Global",                         year: 2017  },
  { id: 194, title: "The first black hole is ever photographed",                     hint: "Event Horizon Telescope",        year: 2019  },
  { id: 195, title: "Notre-Dame Cathedral in Paris is devastated by fire",           hint: "Paris, France",                  year: 2019  },
  { id: 196, title: "COVID-19 is declared a global pandemic",                        hint: "Geneva, Switzerland",            year: 2020  },
  { id: 197, title: "The Suez Canal is blocked by a giant container ship",           hint: "Suez Canal, Egypt",              year: 2021  },
  { id: 198, title: "Russia invades Ukraine",                                        hint: "Ukraine",                        year: 2022  },
  { id: 199, title: "Queen Elizabeth II dies after 70 years on the throne",          hint: "Balmoral, Scotland",             year: 2022  },
  { id: 200, title: "ChatGPT launches, sparking a global AI revolution",             hint: "San Francisco, USA",             year: 2022  },
  { id: 201, title: "The James Webb Space Telescope releases its first images",      hint: "Low Earth Orbit",                year: 2022  },
  { id: 202, title: "Machu Picchu is built by the Inca Empire",                      hint: "Peru",                           year: 1450  },
  { id: 203, title: "Florence Nightingale reforms nursing during the Crimean War",   hint: "Scutari, Turkey",                year: 1854  },
  { id: 204, title: "The Great Plague of London kills 100,000 people",               hint: "London, England",                year: 1665  },
  { id: 205, title: "The Lisbon earthquake kills 30,000 people",                     hint: "Lisbon, Portugal",               year: 1755  },
  { id: 206, title: "The Krakatoa eruption is heard 4,800 km away",                  hint: "Sunda Strait, Indonesia",        year: 1883  },
  { id: 207, title: "The Hoover Dam is completed on the Colorado River",             hint: "Nevada, USA",                    year: 1936  },
  { id: 208, title: "The first Super Bowl is played",                                hint: "Los Angeles, USA",               year: 1967  },
  { id: 209, title: "Tiger Woods wins his first Masters at age 21",                  hint: "Augusta, USA",                   year: 1997  },
  { id: 210, title: "Michael Phelps wins a record 8 gold medals at one Olympics",    hint: "Beijing, China",                 year: 2008  },
  { id: 211, title: "The Silk Road dark web marketplace is shut down by the FBI",    hint: "San Francisco, USA",             year: 2013  },
  { id: 212, title: "WikiLeaks publishes 250,000 classified US diplomatic cables",   hint: "Global",                         year: 2010  },
  { id: 213, title: "The Human Genome Project is completed",                         hint: "Washington D.C., USA",           year: 2003  },
  { id: 214, title: "George Floyd is killed, sparking global protests",              hint: "Minneapolis, USA",               year: 2020  },
  { id: 215, title: "TikTok launches globally and transforms entertainment",         hint: "Beijing, China",                 year: 2017  },
];

// ============================================================
// SPECIAL DATES — curated event picks for cultural moments
// Add more here as the calendar grows (e.g. Christmas, New Year)
// ============================================================
const SPECIAL_DAYS = {
  // International Women's Day — all events driven by women
  "2026-03-08": [84, 76, 137, 188, 77, 112, 203],
};

// ============================================================
// SEEDED RANDOM — deterministic, same result for same seed
// ============================================================
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(s) / 0x7fffffff;
  };
}

function pickEvents(dateStr) {
  // Special days get hand-picked events
  if (SPECIAL_DAYS[dateStr]) {
    return SPECIAL_DAYS[dateStr].map(id => EVENTS.find(e => e.id === id)).filter(Boolean);
  }

  // All other days: seeded random pick of 7 from the full pool
  const seed = dateStr.split("-").reduce((acc, p) => acc * 100 + parseInt(p), 0);
  const rand = seededRandom(seed);
  const pool = [...EVENTS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 7);
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

    const selected = pickEvents(dateStr);

    // Re-assign sequential IDs 1–7 for the game engine
    const eventsWithIds = selected.map((e, i) => ({ ...e, id: i + 1 }));

    // Correct answer order (sorted by year)
    const answerOrder = [...eventsWithIds]
      .sort((a, b) => a.year - b.year)
      .map((e) => e.id);

    // Year labels
    const yearMap = {};
    eventsWithIds.forEach((e) => {
      yearMap[e.id] = e.year < 0 ? `${Math.abs(e.year)} BC` : String(e.year);
    });

    // Shuffle events before sending so they don't arrive in correct order
    const seed = dateStr.split("-").reduce((acc, p) => acc * 100 + parseInt(p), 0);
    const rand = seededRandom(seed + 999);
    const shuffled = [...eventsWithIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return NextResponse.json(
      {
        puzzle: { id: dateStr, date: dateStr, events: shuffled },
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
