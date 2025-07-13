'use client'

import { useState } from 'react'
import { Heart, Coins, Users, TrendingUp, Vote, Shield, Zap, ArrowRight, Wallet, BarChart3, Globe, Star } from 'lucide-react'

export default function DonAIPage() {
  const [selectedCause, setSelectedCause] = useState<string | null>(null)
  const [donationAmount, setDonationAmount] = useState('')

  const featuredCauses = [
    {
      id: '1',
      title: 'Educație pentru Copii din Mediul Rural',
      description: 'Oferim acces la educație de calitate pentru copiii din zonele rurale.',
      raised: 45780,
      goal: 100000,
      donors: 234,
      category: 'Educație',
      verified: true,
      impact: 'Peste 150 de copii ajutați'
    },
    {
      id: '2',
      title: 'Sprijin pentru Vârstnici Singuri',
      description: 'Program de asistență pentru persoanele în vârstă izolate social.',
      raised: 32500,
      goal: 75000,
      donors: 156,
      category: 'Social',
      verified: true,
      impact: '80 de vârstnici sprijiniți'
    },
    {
      id: '3',
      title: 'Mediu Curat - Plantare Păduri',
      description: 'Inițiativă de împădurire pentru protejarea mediului înconjurător.',
      raised: 28340,
      goal: 60000,
      donors: 189,
      category: 'Mediu',
      verified: true,
      impact: '1,200 copaci plantați'
    }
  ]

  const activeVotes = [
    {
      id: '1',
      title: 'Prioritizarea Cauzelor de Sănătate',
      description: 'Votează pentru alocarea fondurilor către cauzele de sănătate publică',
      votes: 1247,
      timeLeft: '2 zile',
      category: 'Sănătate'
    },
    {
      id: '2',
      title: 'Finanțarea Proiectelor Educaționale',
      description: 'Decizia comunității pentru susținerea educației în zone defavorizate',
      votes: 892,
      timeLeft: '5 zile',
      category: 'Educație'
    }
  ]

  const platformStats = {
    totalDonated: '2,847,950',
    activeDonors: '12,450',
    successfulCauses: '1,285',
    blocksValidated: '45,672'
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DonAI</h1>
                <p className="text-xs text-gray-500">Blockchain Donations</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Cauze</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Votare</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Statistici</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Despre</a>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Wallet className="w-4 h-4" />
                <span>Conectează Wallet</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Donații Transparente cu
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Blockchain</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Platforma românească pentru donații transparente cu inteligență artificială și tehnologie blockchain.
              Fiecare donație este verificabilă și impactul este măsurabil.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-center mb-2">
                  <Coins className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.totalDonated} RON</div>
                <div className="text-sm text-gray-600">Total Donat</div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.activeDonors}</div>
                <div className="text-sm text-gray-600">Donatori Activi</div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.successfulCauses}</div>
                <div className="text-sm text-gray-600">Cauze Finalizate</div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.blocksValidated}</div>
                <div className="text-sm text-gray-600">Blocuri Validate</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Începe să Donezi</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-white/80 backdrop-blur-sm border border-blue-200 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 flex items-center justify-center space-x-2">
                <Vote className="w-5 h-5" />
                <span>Participă la Votare</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Causes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cauze Recomandate de AI</h2>
            <p className="text-lg text-gray-600">Inteligența artificială selectează cauzele cu cel mai mare impact potential</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCauses.map((cause) => (
              <div key={cause.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {cause.category}
                  </span>
                  {cause.verified && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-medium">Verificat</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{cause.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{cause.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Adunat: {cause.raised.toLocaleString()} RON</span>
                    <span>Obiectiv: {cause.goal.toLocaleString()} RON</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(cause.raised / cause.goal) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{cause.donors} donatori</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{cause.impact}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Donează Acum</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voting Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Votare Comunitate</h2>
            <p className="text-lg text-gray-600">Participă la deciziile comunității pentru alocarea fondurilor</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {activeVotes.map((vote) => (
              <div key={vote.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {vote.category}
                  </span>
                  <span className="text-sm text-gray-500">Rămân {vote.timeLeft}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{vote.title}</h3>
                <p className="text-gray-600 mb-4">{vote.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Vote className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{vote.votes} voturi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Activ</span>
                  </div>
                </div>

                <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                  <Vote className="w-4 h-4" />
                  <span>Votează Acum</span>
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="bg-white/80 backdrop-blur-sm border border-purple-200 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors">
              Vezi Toate Votările
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">De ce DonAI?</h2>
            <p className="text-lg text-gray-600">Tehnologia blockchain și AI pentru donații transparente și eficiente</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transparență Totală</h3>
              <p className="text-gray-600">Fiecare donație este înregistrată pe blockchain și poate fi verificată public</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Matching</h3>
              <p className="text-gray-600">Inteligența artificială conectează donatorii cu cauzele potrivite</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Impact Măsurabil</h3>
              <p className="text-gray-600">Urmărește impactul real al donațiilor tale cu rapoarte detaliate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DonAI</span>
              </div>
              <p className="text-gray-400">Platforma românească pentru donații transparente cu blockchain și AI.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Cauze</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Votare</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Statistici</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suport</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Ghid Utilizator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comunitate</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">CODAI Ecosystem</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">RomAI</a></li>
                <li><a href="#" className="hover:text-white transition-colors">DexAI</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ConversAI</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CODAI</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DonAI - CODAI Ecosystem. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
