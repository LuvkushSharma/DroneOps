import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  FiX, 
  FiBattery, 
  FiWifi, 
  FiClock, 
  FiEdit2, 
  FiNavigation, 
  FiMap,
  FiTrash2,
  FiCpu,
  FiCalendar,
  FiExternalLink,
  FiTool,
  FiDatabase,
  FiDownload
} from 'react-icons/fi';
import DroneStatusBadge from './DroneStatusBadge';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateFormatter';

/**
 * DroneDetailsModal component for displaying detailed drone information
 * 
 * @param {Object} props
 * @param {Object} props.drone - Drone object with details
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {Function} props.onEdit - Handler for editing the drone
 * @param {Function} props.onDelete - Handler for deleting the drone
 */
const DroneDetailsModal = ({
  drone = {},
  isOpen = false,
  onClose,
  onEdit,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Helper to check if drone has GPS coordinates
  const hasLocation = drone.lastLocation && 
    drone.lastLocation.lat !== undefined && 
    drone.lastLocation.lng !== undefined;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="relative">
                  <div className="bg-gray-800 text-white px-6 py-4">
                    <div className="flex justify-between items-center">
                      <Dialog.Title as="h3" className="text-lg font-medium">
                        {drone.name || 'Drone Details'}
                      </Dialog.Title>
                      
                      <button
                        type="button"
                        className="text-gray-300 hover:text-white"
                        onClick={onClose}
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>
                    {drone.model && (
                      <p className="text-sm text-gray-300 mt-1">
                        {drone.model} {drone.serial && `• Serial: ${drone.serial}`}
                      </p>
                    )}
                  </div>
                  
                  {/* Status bar */}
                  <div className="bg-gray-50 px-6 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <DroneStatusBadge status={drone.status} />
                      
                      <div className="flex items-center text-sm text-gray-700">
                        <FiBattery className={drone.batteryLevel < 20 ? 'text-red-500 mr-1' : 'text-gray-500 mr-1'} />
                        <span>{drone.batteryLevel || 0}%</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-700">
                        <FiWifi className="text-gray-500 mr-1" />
                        <span>{drone.signalStrength || 0}%</span>
                      </div>
                    </div>
                    
                    {drone.lastActive && (
                      <div className="flex items-center text-xs text-gray-500">
                        <FiClock className="mr-1" />
                        <span>Last active: {formatDate(drone.lastActive)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                      <button
                        className={`
                          py-3 px-4 text-center border-b-2 text-sm font-medium
                          ${activeTab === 'overview'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }
                        `}
                        onClick={() => setActiveTab('overview')}
                      >
                        Overview
                      </button>
                      <button
                        className={`
                          py-3 px-4 text-center border-b-2 text-sm font-medium
                          ${activeTab === 'specs'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }
                        `}
                        onClick={() => setActiveTab('specs')}
                      >
                        Specifications
                      </button>
                      <button
                        className={`
                          py-3 px-4 text-center border-b-2 text-sm font-medium
                          ${activeTab === 'history'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }
                        `}
                        onClick={() => setActiveTab('history')}
                      >
                        Flight History
                      </button>
                      <button
                        className={`
                          py-3 px-4 text-center border-b-2 text-sm font-medium
                          ${activeTab === 'maintenance'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }
                        `}
                        onClick={() => setActiveTab('maintenance')}
                      >
                        Maintenance
                      </button>
                    </nav>
                  </div>
                </div>
                
                {/* Tab content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Location and map */}
                      {hasLocation && (
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                          <div className="p-3 text-sm font-medium">Last Known Location</div>
                          <div className="h-44 bg-gray-200 relative">
                            {/* This would be replaced with an actual map component */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-gray-500 flex items-center">
                                <FiMap className="mr-2" />
                                {drone.lastLocation.name || 
                                  `${drone.lastLocation.lat.toFixed(6)}, ${drone.lastLocation.lng.toFixed(6)}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Quick stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500 mb-1">Total Flight Time</div>
                          <div className="text-xl font-medium">
                            {drone.totalFlightTime 
                              ? `${Math.floor(drone.totalFlightTime / 60)} hours ${drone.totalFlightTime % 60} min`
                              : 'No data'
                            }
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500 mb-1">Total Flights</div>
                          <div className="text-xl font-medium">
                            {drone.totalFlights || '0'} missions
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {drone.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                          <p className="text-gray-600">{drone.description}</p>
                        </div>
                      )}
                      
                      {/* Tags */}
                      {drone.tags && drone.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {drone.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'specs' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Drone Information</h4>
                          <dl className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Model</dt>
                              <dd>{drone.model || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Manufacturer</dt>
                              <dd>{drone.manufacturer || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Serial Number</dt>
                              <dd>{drone.serial || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Registration</dt>
                              <dd>{drone.registration || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Type</dt>
                              <dd>{drone.type || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Weight</dt>
                              <dd>{drone.weight ? `${drone.weight} g` : 'N/A'}</dd>
                            </div>
                          </dl>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
                          <dl className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Max Speed</dt>
                              <dd>{drone.maxSpeed ? `${drone.maxSpeed} m/s` : 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Max Flight Time</dt>
                              <dd>{drone.maxFlightTime ? `${drone.maxFlightTime} min` : 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Max Range</dt>
                              <dd>{drone.maxRange ? `${drone.maxRange} m` : 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Max Altitude</dt>
                              <dd>{drone.maxAltitude ? `${drone.maxAltitude} m` : 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Max Wind Resistance</dt>
                              <dd>{drone.windResistance ? `${drone.windResistance} m/s` : 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Operating Temperature</dt>
                              <dd>{drone.operatingTemp ? drone.operatingTemp : 'N/A'}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                      
                      {/* Firmware and Software */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Firmware & Software</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Firmware Version</dt>
                            <dd className="flex items-center">
                              {drone.firmware || 'N/A'}
                              {drone.firmwareUpdateAvailable && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Update Available
                                </span>
                              )}
                            </dd>
                          </div>
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Last Updated</dt>
                            <dd>{drone.lastFirmwareUpdate ? formatDate(drone.lastFirmwareUpdate) : 'Never'}</dd>
                          </div>
                        </dl>
                      </div>
                      
                      {/* Equipment */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Equipment</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Camera</dt>
                            <dd>{drone.camera || 'N/A'}</dd>
                          </div>
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Gimbal</dt>
                            <dd>{drone.gimbal || 'N/A'}</dd>
                          </div>
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Battery Type</dt>
                            <dd>{drone.batteryType || 'N/A'}</dd>
                          </div>
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Battery Capacity</dt>
                            <dd>{drone.batteryCapacity ? `${drone.batteryCapacity} mAh` : 'N/A'}</dd>
                          </div>
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Sensors</dt>
                            <dd>{drone.sensors || 'N/A'}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'history' && (
                    <div className="space-y-4">
                      {/* Flight history would be displayed here */}
                      {drone.flightHistory?.length > 0 ? (
                        <div className="overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Mission
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Duration
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {drone.flightHistory.map((flight, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                    {formatDate(flight.date)}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                    {flight.mission}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                    {flight.duration} min
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      flight.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                      flight.status === 'failed' ? 'bg-red-100 text-red-800' : 
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {flight.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-gray-50 rounded-lg">
                          <FiClock className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-gray-500">No flight history available for this drone</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'maintenance' && (
                    <div className="space-y-4">
                      {/* Maintenance history */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 flex items-center justify-between mb-2">
                          <span>Maintenance History</span>
                          <button className="text-primary-600 text-xs hover:text-primary-800">
                            <FiPlus className="inline mr-1" />
                            Add Record
                          </button>
                        </h4>
                        
                        {drone.maintenanceHistory?.length > 0 ? (
                          <div className="space-y-3">
                            {drone.maintenanceHistory.map((record, index) => (
                              <div key={index} className="border border-gray-200 rounded-md p-3">
                                <div className="flex justify-between">
                                  <span className="font-medium text-sm">{record.type}</span>
                                  <span className="text-xs text-gray-500">{formatDate(record.date)}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                                {record.technicianId && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Performed by: {record.technicianName || record.technicianId}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <FiTool className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-gray-500">No maintenance records available</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Next scheduled maintenance */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">Next Scheduled Maintenance</h4>
                        <p className="text-sm text-yellow-700">
                          {drone.nextMaintenance 
                            ? formatDate(drone.nextMaintenance)
                            : 'No maintenance scheduled'
                          }
                        </p>
                      </div>
                      
                      {/* Components and hours */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Component Hours</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-24">Props</span>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(((drone.propHours || 0) / 20) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-2 w-16">
                              {drone.propHours || 0}/20h
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-24">Battery</span>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(((drone.batteryCharges || 0) / 300) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-2 w-16">
                              {drone.batteryCharges || 0}/300
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-24">Motors</span>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(((drone.motorHours || 0) / 100) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-2 w-16">
                              {drone.motorHours || 0}/100h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Footer with actions */}
                <div className="bg-gray-50 px-6 py-3 flex justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => window.location.href = `/monitor/${drone._id || drone.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FiExternalLink className="mr-1.5" />
                      Monitor
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={onEdit}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FiEdit2 className="mr-1.5" />
                      Edit
                    </button>
                    
                    <button
                      type="button"
                      onClick={onDelete}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <FiTrash2 className="mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DroneDetailsModal;