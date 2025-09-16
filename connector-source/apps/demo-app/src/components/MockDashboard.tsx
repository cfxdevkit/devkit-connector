"use client";

import React, { useState, useEffect } from 'react';

interface ComponentStatus {
  name: string;
  status: 'NOT_STARTED' | 'PARTIALLY_IMPLEMENTED' | 'IN_PROGRESS' | 'IMPLEMENTED';
  progress: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  team: string;
  estimatedTime: string;
  description: string;
}

interface Phase {
  name: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  components: ComponentStatus[];
}

export default function MockDashboard() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real implementation, this would come from an API
    const mockPhases: Phase[] = [
      {
        name: 'Phase 1: Core Infrastructure',
        status: 'IN_PROGRESS',
        progress: 20,
        components: [
          {
            name: 'Database Implementation',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'HIGH',
            team: 'Backend',
            estimatedTime: '2-3 weeks',
            description: 'Complete database schema with Prisma ORM'
          },
          {
            name: 'Authentication System',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'HIGH',
            team: 'Backend',
            estimatedTime: '1-2 weeks',
            description: 'JWT-based authentication with session management'
          },
          {
            name: 'Security Implementation',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'CRITICAL',
            team: 'Security',
            estimatedTime: '3-4 weeks',
            description: 'Private key management and encryption services'
          },
          {
            name: 'Logging System',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'HIGH',
            team: 'Backend',
            estimatedTime: '1-2 weeks',
            description: 'Structured logging with Winston'
          },
          {
            name: 'Unit Tests',
            status: 'PARTIALLY_IMPLEMENTED',
            progress: 30,
            priority: 'HIGH',
            team: 'QA',
            estimatedTime: '2-3 weeks',
            description: 'Comprehensive unit test coverage'
          }
        ]
      },
      {
        name: 'Phase 2: Production Readiness',
        status: 'NOT_STARTED',
        progress: 0,
        components: [
          {
            name: 'CI/CD Pipeline',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'HIGH',
            team: 'DevOps',
            estimatedTime: '1-2 weeks',
            description: 'Automated testing and deployment pipeline'
          },
          {
            name: 'Docker Deployment',
            status: 'PARTIALLY_IMPLEMENTED',
            progress: 60,
            priority: 'HIGH',
            team: 'DevOps',
            estimatedTime: '1 week',
            description: 'Containerized deployment setup'
          },
          {
            name: 'Error Handling',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'HIGH',
            team: 'Backend',
            estimatedTime: '1-2 weeks',
            description: 'Circuit breakers and retry logic'
          },
          {
            name: 'Performance Optimization',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'MEDIUM',
            team: 'Backend',
            estimatedTime: '2-3 weeks',
            description: 'Caching and load balancing'
          },
          {
            name: 'Documentation',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'MEDIUM',
            team: 'Documentation',
            estimatedTime: '1-2 weeks',
            description: 'API docs and user guides'
          }
        ]
      },
      {
        name: 'Phase 3: Advanced Features',
        status: 'NOT_STARTED',
        progress: 0,
        components: [
          {
            name: 'Advanced Security',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'HIGH',
            team: 'Security',
            estimatedTime: '3-4 weeks',
            description: 'HSM, MFA, and biometric authentication'
          },
          {
            name: 'Compliance & Governance',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'HIGH',
            team: 'Compliance',
            estimatedTime: '2-3 weeks',
            description: 'Audit trails and regulatory compliance'
          },
          {
            name: 'Analytics & Reporting',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'MEDIUM',
            team: 'Data',
            estimatedTime: '2-3 weeks',
            description: 'Business intelligence and reporting'
          },
          {
            name: 'Integration Capabilities',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'MEDIUM',
            team: 'Backend',
            estimatedTime: '2-3 weeks',
            description: 'Webhooks and SDK development'
          },
          {
            name: 'Mobile Applications',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'LOW',
            team: 'Mobile',
            estimatedTime: '4-6 weeks',
            description: 'Native mobile applications'
          }
        ]
      },
      {
        name: 'Phase 4: Business Features',
        status: 'NOT_STARTED',
        progress: 0,
        components: [
          {
            name: 'Advanced Business Logic',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'MEDIUM',
            team: 'Backend',
            estimatedTime: '3-4 weeks',
            description: 'Multi-sig and scheduled transactions'
          },
          {
            name: 'User Experience',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'MEDIUM',
            team: 'Frontend',
            estimatedTime: '2-3 weeks',
            description: 'Mobile apps and accessibility'
          },
          {
            name: 'Business Intelligence',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'LOW',
            team: 'Data',
            estimatedTime: '2-3 weeks',
            description: 'Custom dashboards and analytics'
          },
          {
            name: 'Support Tools',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'LOW',
            team: 'Support',
            estimatedTime: '1-2 weeks',
            description: 'Help desk and knowledge base'
          },
          {
            name: 'Third-party Integrations',
            status: 'NOT_STARTED',
            progress: 0,
            priority: 'LOW',
            team: 'Backend',
            estimatedTime: '2-3 weeks',
            description: 'Marketplace and plugin system'
          }
        ]
      }
    ];

    setPhases(mockPhases);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IMPLEMENTED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PARTIALLY_IMPLEMENTED': return 'bg-yellow-100 text-yellow-800';
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading implementation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Implementation Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Track progress of the Conflux Dual Wallet System implementation
        </p>
      </div>

      {/* Phase Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Implementation Phases</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {phases.map((phase, index) => (
            <button
              key={index}
              onClick={() => setSelectedPhase(index)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPhase === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold mb-2">{phase.name}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${phase.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {phase.progress}% Complete
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Phase Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {phases[selectedPhase]?.name}
          </h2>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              phases[selectedPhase]?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              phases[selectedPhase]?.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {phases[selectedPhase]?.status.replace('_', ' ')}
            </span>
            <span className="text-sm text-gray-600">
              {phases[selectedPhase]?.progress}% Complete
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${phases[selectedPhase]?.progress}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {phases[selectedPhase]?.components.map((component, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{component.name}</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    getStatusColor(component.status)
                  }`}>
                    {component.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    getPriorityColor(component.priority)
                  }`}>
                    {component.priority}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {component.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{component.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${component.progress}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Team:</span> {component.team}
                  </div>
                  <div>
                    <span className="font-medium">Est. Time:</span> {component.estimatedTime}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">120</div>
            <div className="text-sm text-gray-600">Total Components</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">15</div>
            <div className="text-sm text-gray-600">Implemented</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">8</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">12.5%</div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
}
