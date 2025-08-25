#!/usr/bin/env python3
"""
RomAI Reality Grounding System
Advanced system for real-world interaction through sensors, actuators, and physical world modeling

Based on Microsoft IoT/AI best practices and latest embodied intelligence research.
Integrates Azure AI Services, IoT Hub, and cognitive capabilities for true AGI grounding.

Key Features:
- Physical World Modeling with causal reasoning
- Sensor/Actuator Integration (Azure IoT)
- Empirical Hypothesis Validation
- Real-time Physical Feedback Loops
- World Model Construction and Updates
- Causal Inference and Prediction
"""

import asyncio
import logging
import json
import numpy as np
import torch
import torch.nn as nn
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime, timedelta
from enum import Enum
import requests
import websockets
import azure.iot.device
from azure.iot.device import IoTHubDeviceClient, Message
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.core.credentials import AzureKeyCredential
import cv2
import time
import threading
import queue

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SensorType(Enum):
    """Types of physical sensors"""
    CAMERA = "camera"
    MICROPHONE = "microphone" 
    TEMPERATURE = "temperature"
    PRESSURE = "pressure"
    ACCELEROMETER = "accelerometer"
    GYROSCOPE = "gyroscope"
    GPS = "gps"
    LIDAR = "lidar"
    ULTRASONIC = "ultrasonic"
    TOUCH = "touch"
    CHEMICAL = "chemical"
    MAGNETIC = "magnetic"

class ActuatorType(Enum):
    """Types of physical actuators"""
    SERVO = "servo"
    STEPPER = "stepper"
    DC_MOTOR = "dc_motor"
    LED = "led"
    SPEAKER = "speaker"
    HEATING = "heating"
    COOLING = "cooling"
    VALVE = "valve"
    PUMP = "pump"
    DISPLAY = "display"
    ROBOTIC_ARM = "robotic_arm"
    WHEEL = "wheel"

@dataclass
class SensorReading:
    """Individual sensor measurement"""
    sensor_id: str
    sensor_type: SensorType
    timestamp: datetime
    value: Union[float, List[float], np.ndarray, Dict]
    confidence: float
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ActuatorCommand:
    """Command to actuator"""
    actuator_id: str
    actuator_type: ActuatorType
    timestamp: datetime
    command: Union[float, List[float], Dict]
    expected_duration: float
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class PhysicalHypothesis:
    """Testable hypothesis about physical world"""
    hypothesis_id: str
    description: str
    prediction: Dict[str, Any]
    test_conditions: Dict[str, Any]
    expected_outcome: Dict[str, Any]
    confidence: float
    created_at: datetime
    tested: bool = False
    results: Optional[Dict[str, Any]] = None

@dataclass
class WorldState:
    """Current state of the physical world"""
    timestamp: datetime
    sensor_readings: List[SensorReading]
    actuator_states: Dict[str, Dict[str, Any]]
    derived_properties: Dict[str, Any]
    uncertainty_map: Dict[str, float]
    causal_links: Dict[str, List[str]]

class CausalModel(nn.Module):
    """Neural network for causal reasoning about physical world"""
    
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        # Causal structure learning
        self.causal_structure = nn.Linear(hidden_dim, hidden_dim * hidden_dim)
        
        # Effect prediction
        self.effect_predictor = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim)
        )
        
        # Uncertainty estimation
        self.uncertainty_head = nn.Linear(hidden_dim, output_dim)
        
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        # Encode input state
        encoded = self.encoder(x)
        
        # Learn causal structure (adjacency matrix)
        causal_adj = self.causal_structure(encoded)
        causal_adj = torch.sigmoid(causal_adj).view(-1, encoded.size(-1), encoded.size(-1))
        
        # Apply causal structure to predict effects
        causal_features = torch.bmm(causal_adj, encoded.unsqueeze(-1)).squeeze(-1)
        
        # Predict effects and uncertainty
        effects = self.effect_predictor(causal_features)
        uncertainty = torch.sigmoid(self.uncertainty_head(encoded))
        
        return effects, uncertainty, causal_adj

class WorldModel(nn.Module):
    """Physical world dynamics model"""
    
    def __init__(self, state_dim: int, action_dim: int, hidden_dim: int = 256):
        super().__init__()
        self.state_dim = state_dim
        self.action_dim = action_dim
        
        # World dynamics prediction
        self.dynamics_net = nn.Sequential(
            nn.Linear(state_dim + action_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, state_dim)
        )
        
        # Observation model
        self.observation_net = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, state_dim)
        )
        
        # Physics constraints
        self.physics_constraints = nn.ModuleDict({
            'conservation': nn.Linear(state_dim, 1),
            'continuity': nn.Linear(state_dim, 1),
            'causality': nn.Linear(state_dim + action_dim, 1)
        })
    
    def predict_next_state(self, current_state: torch.Tensor, action: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Predict next world state given current state and action"""
        combined_input = torch.cat([current_state, action], dim=-1)
        next_state = self.dynamics_net(combined_input)
        
        # Apply physics constraints
        physics_loss = 0.0
        for constraint_name, constraint_net in self.physics_constraints.items():
            if constraint_name == 'causality':
                constraint_violation = constraint_net(combined_input)
            else:
                constraint_violation = constraint_net(next_state)
            physics_loss += torch.mean(constraint_violation ** 2)
        
        return next_state, physics_loss
    
    def generate_observation(self, state: torch.Tensor) -> torch.Tensor:
        """Generate expected observation from state"""
        return self.observation_net(state)

class SensorManager:
    """Manages all physical sensors"""
    
    def __init__(self, azure_iot_client: Optional[IoTHubDeviceClient] = None):
        self.sensors: Dict[str, Dict[str, Any]] = {}
        self.azure_iot_client = azure_iot_client
        self.reading_queue = queue.Queue(maxsize=1000)
        self.active = False
        
    def register_sensor(self, sensor_id: str, sensor_type: SensorType, 
                       config: Dict[str, Any]) -> bool:
        """Register a new sensor"""
        try:
            self.sensors[sensor_id] = {
                'type': sensor_type,
                'config': config,
                'last_reading': None,
                'active': True,
                'calibration': config.get('calibration', {}),
                'error_count': 0
            }
            logger.info(f"Registered sensor: {sensor_id} ({sensor_type.value})")
            return True
        except Exception as e:
            logger.error(f"Failed to register sensor {sensor_id}: {e}")
            return False
    
    async def read_sensor(self, sensor_id: str) -> Optional[SensorReading]:
        """Read from specific sensor"""
        if sensor_id not in self.sensors:
            logger.error(f"Unknown sensor: {sensor_id}")
            return None
            
        sensor = self.sensors[sensor_id]
        if not sensor['active']:
            return None
            
        try:
            # Simulate sensor reading (in real implementation, this would interface with actual hardware)
            value = await self._simulate_sensor_reading(sensor_id, sensor['type'])
            
            reading = SensorReading(
                sensor_id=sensor_id,
                sensor_type=sensor['type'],
                timestamp=datetime.now(),
                value=value,
                confidence=max(0.5, 1.0 - sensor['error_count'] * 0.1),
                metadata={'calibration': sensor['calibration']}
            )
            
            sensor['last_reading'] = reading
            self.reading_queue.put(reading)
            
            # Send to Azure IoT if connected
            if self.azure_iot_client:
                await self._send_to_azure_iot(reading)
                
            return reading
            
        except Exception as e:
            logger.error(f"Error reading sensor {sensor_id}: {e}")
            sensor['error_count'] += 1
            return None
    
    async def _simulate_sensor_reading(self, sensor_id: str, sensor_type: SensorType) -> Union[float, List[float], np.ndarray]:
        """Simulate sensor readings (replace with actual hardware interface)"""
        if sensor_type == SensorType.CAMERA:
            # Simulate camera frame (in real implementation, use cv2.VideoCapture)
            return np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        elif sensor_type == SensorType.TEMPERATURE:
            return 20.0 + np.random.normal(0, 2)
        elif sensor_type == SensorType.PRESSURE:
            return 1013.25 + np.random.normal(0, 5)
        elif sensor_type == SensorType.ACCELEROMETER:
            return [np.random.normal(0, 0.1) for _ in range(3)]
        elif sensor_type == SensorType.GPS:
            return {'lat': 45.0 + np.random.normal(0, 0.001), 
                   'lon': -122.0 + np.random.normal(0, 0.001)}
        else:
            return np.random.normal(0, 1)
    
    async def _send_to_azure_iot(self, reading: SensorReading):
        """Send sensor reading to Azure IoT Hub"""
        try:
            message_data = {
                'sensor_id': reading.sensor_id,
                'sensor_type': reading.sensor_type.value,
                'timestamp': reading.timestamp.isoformat(),
                'value': reading.value if isinstance(reading.value, (int, float, list, dict)) else reading.value.tolist(),
                'confidence': reading.confidence
            }
            
            message = Message(json.dumps(message_data))
            message.content_encoding = "utf-8"
            message.content_type = "application/json"
            
            await self.azure_iot_client.send_message(message)
            logger.debug(f"Sent sensor reading to Azure IoT: {reading.sensor_id}")
            
        except Exception as e:
            logger.error(f"Failed to send to Azure IoT: {e}")

class ActuatorManager:
    """Manages all physical actuators"""
    
    def __init__(self, azure_iot_client: Optional[IoTHubDeviceClient] = None):
        self.actuators: Dict[str, Dict[str, Any]] = {}
        self.azure_iot_client = azure_iot_client
        self.command_queue = queue.Queue(maxsize=100)
        self.active = False
        
    def register_actuator(self, actuator_id: str, actuator_type: ActuatorType,
                         config: Dict[str, Any]) -> bool:
        """Register a new actuator"""
        try:
            self.actuators[actuator_id] = {
                'type': actuator_type,
                'config': config,
                'current_state': config.get('initial_state', {}),
                'active': True,
                'error_count': 0,
                'last_command': None
            }
            logger.info(f"Registered actuator: {actuator_id} ({actuator_type.value})")
            return True
        except Exception as e:
            logger.error(f"Failed to register actuator {actuator_id}: {e}")
            return False
    
    async def send_command(self, command: ActuatorCommand) -> bool:
        """Send command to actuator"""
        if command.actuator_id not in self.actuators:
            logger.error(f"Unknown actuator: {command.actuator_id}")
            return False
            
        actuator = self.actuators[command.actuator_id]
        if not actuator['active']:
            return False
            
        try:
            # Execute command (in real implementation, interface with hardware)
            success = await self._execute_actuator_command(command)
            
            if success:
                actuator['last_command'] = command
                actuator['current_state'].update({'last_command_time': datetime.now()})
                self.command_queue.put(command)
                
                # Send to Azure IoT if connected
                if self.azure_iot_client:
                    await self._send_command_to_azure_iot(command)
                    
            return success
            
        except Exception as e:
            logger.error(f"Error executing command for {command.actuator_id}: {e}")
            actuator['error_count'] += 1
            return False
    
    async def _execute_actuator_command(self, command: ActuatorCommand) -> bool:
        """Execute actuator command (replace with actual hardware interface)"""
        # Simulate actuator execution
        logger.info(f"Executing {command.actuator_type.value} command: {command.command}")
        
        # Simulate execution time
        await asyncio.sleep(min(command.expected_duration, 0.1))
        
        # Simulate 95% success rate
        return np.random.random() > 0.05
    
    async def _send_command_to_azure_iot(self, command: ActuatorCommand):
        """Send actuator command to Azure IoT for logging"""
        try:
            message_data = {
                'actuator_id': command.actuator_id,
                'actuator_type': command.actuator_type.value,
                'timestamp': command.timestamp.isoformat(),
                'command': command.command,
                'expected_duration': command.expected_duration
            }
            
            message = Message(json.dumps(message_data))
            message.content_encoding = "utf-8"
            message.content_type = "application/json"
            
            await self.azure_iot_client.send_message(message)
            logger.debug(f"Sent actuator command to Azure IoT: {command.actuator_id}")
            
        except Exception as e:
            logger.error(f"Failed to send command to Azure IoT: {e}")

class HypothesisValidator:
    """Validates physical world hypotheses through experimentation"""
    
    def __init__(self, sensor_manager: SensorManager, actuator_manager: ActuatorManager):
        self.sensor_manager = sensor_manager
        self.actuator_manager = actuator_manager
        self.active_experiments: Dict[str, Dict[str, Any]] = {}
        self.completed_experiments: List[Dict[str, Any]] = []
        
    async def test_hypothesis(self, hypothesis: PhysicalHypothesis) -> Dict[str, Any]:
        """Design and execute experiment to test hypothesis"""
        logger.info(f"Testing hypothesis: {hypothesis.description}")
        
        experiment_id = f"exp_{hypothesis.hypothesis_id}_{int(time.time())}"
        
        try:
            # Design experiment based on hypothesis
            experiment_design = self._design_experiment(hypothesis)
            
            # Setup experiment
            self.active_experiments[experiment_id] = {
                'hypothesis': hypothesis,
                'design': experiment_design,
                'start_time': datetime.now(),
                'status': 'running',
                'data': []
            }
            
            # Execute experiment
            results = await self._execute_experiment(experiment_id, experiment_design)
            
            # Analyze results
            analysis = self._analyze_experimental_results(hypothesis, results)
            
            # Update experiment record
            self.active_experiments[experiment_id].update({
                'end_time': datetime.now(),
                'status': 'completed',
                'results': results,
                'analysis': analysis
            })
            
            # Move to completed experiments
            self.completed_experiments.append(self.active_experiments.pop(experiment_id))
            
            # Update hypothesis with results
            hypothesis.tested = True
            hypothesis.results = analysis
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error testing hypothesis {hypothesis.hypothesis_id}: {e}")
            if experiment_id in self.active_experiments:
                self.active_experiments[experiment_id]['status'] = 'failed'
                self.active_experiments[experiment_id]['error'] = str(e)
            return {'success': False, 'error': str(e)}
    
    def _design_experiment(self, hypothesis: PhysicalHypothesis) -> Dict[str, Any]:
        """Design experiment to test hypothesis"""
        design = {
            'control_variables': [],
            'manipulation_variables': [],
            'measurement_variables': [],
            'duration': 30.0,  # seconds
            'sampling_rate': 10.0,  # Hz
            'repetitions': 3
        }
        
        # Extract variables from hypothesis
        for condition, value in hypothesis.test_conditions.items():
            if isinstance(value, dict) and 'manipulate' in value:
                design['manipulation_variables'].append({
                    'variable': condition,
                    'values': value['manipulate'],
                    'actuator': value.get('actuator')
                })
            else:
                design['control_variables'].append({
                    'variable': condition,
                    'value': value
                })
        
        for outcome, details in hypothesis.expected_outcome.items():
            design['measurement_variables'].append({
                'variable': outcome,
                'sensor': details.get('sensor'),
                'expected_range': details.get('range')
            })
        
        return design
    
    async def _execute_experiment(self, experiment_id: str, design: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Execute the designed experiment"""
        results = []
        experiment = self.active_experiments[experiment_id]
        
        for repetition in range(design['repetitions']):
            logger.info(f"Experiment {experiment_id} - Repetition {repetition + 1}")
            
            # Set control conditions
            for control in design['control_variables']:
                # Apply control settings (implementation specific)
                pass
            
            # Execute manipulations and collect data
            for manipulation in design['manipulation_variables']:
                if manipulation.get('actuator'):
                    command = ActuatorCommand(
                        actuator_id=manipulation['actuator'],
                        actuator_type=ActuatorType.SERVO,  # Default, should be specified
                        timestamp=datetime.now(),
                        command=manipulation['values'],
                        expected_duration=design['duration']
                    )
                    await self.actuator_manager.send_command(command)
            
            # Collect measurements
            measurement_data = []
            start_time = time.time()
            
            while time.time() - start_time < design['duration']:
                timestamp = datetime.now()
                measurement_point = {'timestamp': timestamp}
                
                # Read from all relevant sensors
                for measurement in design['measurement_variables']:
                    if measurement.get('sensor'):
                        reading = await self.sensor_manager.read_sensor(measurement['sensor'])
                        if reading:
                            measurement_point[measurement['variable']] = reading.value
                
                measurement_data.append(measurement_point)
                await asyncio.sleep(1.0 / design['sampling_rate'])
            
            results.append({
                'repetition': repetition,
                'data': measurement_data,
                'summary': self._summarize_measurement_data(measurement_data)
            })
        
        return results
    
    def _summarize_measurement_data(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Summarize measurement data for analysis"""
        summary = {}
        
        for point in data:
            for key, value in point.items():
                if key == 'timestamp':
                    continue
                    
                if key not in summary:
                    summary[key] = []
                
                if isinstance(value, (int, float)):
                    summary[key].append(value)
                elif isinstance(value, list) and all(isinstance(x, (int, float)) for x in value):
                    summary[key].extend(value)
        
        # Calculate statistics
        for key, values in summary.items():
            if values:
                summary[key] = {
                    'mean': np.mean(values),
                    'std': np.std(values),
                    'min': np.min(values),
                    'max': np.max(values),
                    'count': len(values)
                }
        
        return summary
    
    def _analyze_experimental_results(self, hypothesis: PhysicalHypothesis, 
                                    results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze experimental results against hypothesis predictions"""
        analysis = {
            'hypothesis_supported': False,
            'confidence': 0.0,
            'evidence': [],
            'statistical_significance': 0.0,
            'effect_size': 0.0
        }
        
        # Compare results with expected outcomes
        for expected_var, expected_details in hypothesis.expected_outcome.items():
            evidence_item = {
                'variable': expected_var,
                'expected': expected_details,
                'observed': [],
                'match': False
            }
            
            # Extract observed values for this variable
            for result in results:
                if expected_var in result['summary']:
                    evidence_item['observed'].append(result['summary'][expected_var])
            
            # Check if observations match expectations
            if evidence_item['observed']:
                observed_mean = np.mean([obs['mean'] for obs in evidence_item['observed']])
                expected_range = expected_details.get('range', [float('-inf'), float('inf')])
                
                if expected_range[0] <= observed_mean <= expected_range[1]:
                    evidence_item['match'] = True
                    evidence_item['deviation'] = 0.0
                else:
                    # Calculate deviation from expected range
                    if observed_mean < expected_range[0]:
                        evidence_item['deviation'] = expected_range[0] - observed_mean
                    else:
                        evidence_item['deviation'] = observed_mean - expected_range[1]
            
            analysis['evidence'].append(evidence_item)
        
        # Calculate overall support
        matching_evidence = sum(1 for e in analysis['evidence'] if e['match'])
        total_evidence = len(analysis['evidence'])
        
        if total_evidence > 0:
            support_ratio = matching_evidence / total_evidence
            analysis['hypothesis_supported'] = support_ratio > 0.5
            analysis['confidence'] = support_ratio
        
        return analysis

class RealityGroundingSystem:
    """Main reality grounding system integrating all components"""
    
    def __init__(self, device_id: str = "romai-reality-grounding", 
                 azure_connection_string: Optional[str] = None):
        self.device_id = device_id
        self.azure_connection_string = azure_connection_string
        self.azure_iot_client = None
        
        # Initialize components
        self.sensor_manager = SensorManager()
        self.actuator_manager = ActuatorManager()
        self.hypothesis_validator = HypothesisValidator(self.sensor_manager, self.actuator_manager)
        
        # Neural models
        self.causal_model = CausalModel(input_dim=128, hidden_dim=256, output_dim=64)
        self.world_model = WorldModel(state_dim=64, action_dim=32)
        
        # World state tracking
        self.current_world_state = WorldState(
            timestamp=datetime.now(),
            sensor_readings=[],
            actuator_states={},
            derived_properties={},
            uncertainty_map={},
            causal_links={}
        )
        
        # Active hypotheses
        self.active_hypotheses: List[PhysicalHypothesis] = []
        self.validated_hypotheses: List[PhysicalHypothesis] = []
        
        # System state
        self.active = False
        self.learning_enabled = True
        
        logger.info("Reality Grounding System initialized")
    
    async def initialize(self) -> bool:
        """Initialize the reality grounding system"""
        try:
            # Initialize Azure IoT connection if configured
            if self.azure_connection_string:
                self.azure_iot_client = IoTHubDeviceClient.create_from_connection_string(
                    self.azure_connection_string
                )
                await self.azure_iot_client.connect()
                logger.info("Connected to Azure IoT Hub")
                
                # Update component clients
                self.sensor_manager.azure_iot_client = self.azure_iot_client
                self.actuator_manager.azure_iot_client = self.azure_iot_client
            
            # Register default sensors and actuators
            await self._setup_default_sensors_actuators()
            
            # Start background tasks
            self.active = True
            asyncio.create_task(self._world_state_update_loop())
            asyncio.create_task(self._hypothesis_generation_loop())
            asyncio.create_task(self._causal_learning_loop())
            
            logger.info("Reality Grounding System initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Reality Grounding System: {e}")
            return False
    
    async def _setup_default_sensors_actuators(self):
        """Setup default sensors and actuators for testing"""
        # Register default sensors
        self.sensor_manager.register_sensor("camera_main", SensorType.CAMERA, 
                                           {"resolution": [640, 480], "fps": 30})
        self.sensor_manager.register_sensor("temp_ambient", SensorType.TEMPERATURE,
                                          {"range": [-20, 50], "precision": 0.1})
        self.sensor_manager.register_sensor("pressure_main", SensorType.PRESSURE,
                                          {"range": [900, 1100], "precision": 0.1})
        self.sensor_manager.register_sensor("accel_main", SensorType.ACCELEROMETER,
                                          {"range": [-10, 10], "precision": 0.01})
        self.sensor_manager.register_sensor("gps_main", SensorType.GPS,
                                          {"precision": 1e-6})
        
        # Register default actuators
        self.actuator_manager.register_actuator("servo_1", ActuatorType.SERVO,
                                               {"range": [0, 180], "speed": 60})
        self.actuator_manager.register_actuator("led_status", ActuatorType.LED,
                                               {"colors": ["red", "green", "blue"], "brightness": [0, 255]})
        self.actuator_manager.register_actuator("speaker_main", ActuatorType.SPEAKER,
                                               {"frequency_range": [20, 20000], "volume": [0, 100]})
    
    async def _world_state_update_loop(self):
        """Continuously update world state from sensors"""
        while self.active:
            try:
                # Collect sensor readings
                current_readings = []
                for sensor_id in self.sensor_manager.sensors:
                    reading = await self.sensor_manager.read_sensor(sensor_id)
                    if reading:
                        current_readings.append(reading)
                
                # Update world state
                self.current_world_state = WorldState(
                    timestamp=datetime.now(),
                    sensor_readings=current_readings,
                    actuator_states={aid: act['current_state'] 
                                   for aid, act in self.actuator_manager.actuators.items()},
                    derived_properties=await self._derive_world_properties(current_readings),
                    uncertainty_map=await self._estimate_uncertainties(current_readings),
                    causal_links=await self._infer_causal_links(current_readings)
                )
                
                logger.debug(f"Updated world state with {len(current_readings)} sensor readings")
                await asyncio.sleep(1.0)  # Update at 1 Hz
                
            except Exception as e:
                logger.error(f"Error in world state update loop: {e}")
                await asyncio.sleep(5.0)
    
    async def _derive_world_properties(self, readings: List[SensorReading]) -> Dict[str, Any]:
        """Derive higher-level properties from sensor readings"""
        properties = {}
        
        try:
            # Group readings by type
            readings_by_type = {}
            for reading in readings:
                sensor_type = reading.sensor_type
                if sensor_type not in readings_by_type:
                    readings_by_type[sensor_type] = []
                readings_by_type[sensor_type].append(reading)
            
            # Derive properties based on available sensors
            if SensorType.TEMPERATURE in readings_by_type:
                temps = [r.value for r in readings_by_type[SensorType.TEMPERATURE]]
                properties['ambient_temperature'] = {
                    'mean': np.mean(temps),
                    'stability': 1.0 / (1.0 + np.std(temps))
                }
            
            if SensorType.ACCELEROMETER in readings_by_type:
                accels = [r.value for r in readings_by_type[SensorType.ACCELEROMETER]]
                # Calculate motion properties
                motion_magnitudes = [np.linalg.norm(acc) for acc in accels if isinstance(acc, (list, np.ndarray))]
                if motion_magnitudes:
                    properties['motion_state'] = {
                        'activity_level': np.mean(motion_magnitudes),
                        'is_moving': np.mean(motion_magnitudes) > 0.1,
                        'stability': 1.0 / (1.0 + np.std(motion_magnitudes))
                    }
            
            if SensorType.GPS in readings_by_type:
                gps_readings = [r.value for r in readings_by_type[SensorType.GPS] 
                               if isinstance(r.value, dict)]
                if gps_readings:
                    properties['location_state'] = {
                        'current_lat': gps_readings[-1]['lat'],
                        'current_lon': gps_readings[-1]['lon'],
                        'location_stability': len(set((r['lat'], r['lon']) for r in gps_readings)) == 1
                    }
            
        except Exception as e:
            logger.error(f"Error deriving world properties: {e}")
            
        return properties
    
    async def _estimate_uncertainties(self, readings: List[SensorReading]) -> Dict[str, float]:
        """Estimate uncertainty for different aspects of world state"""
        uncertainties = {}
        
        # Base uncertainty on sensor confidence and reading consistency
        for reading in readings:
            base_uncertainty = 1.0 - reading.confidence
            
            # Add temporal uncertainty based on reading age
            age_seconds = (datetime.now() - reading.timestamp).total_seconds()
            temporal_uncertainty = min(0.5, age_seconds / 300.0)  # Max 50% uncertainty after 5 minutes
            
            total_uncertainty = min(1.0, base_uncertainty + temporal_uncertainty)
            uncertainties[f"{reading.sensor_id}_{reading.sensor_type.value}"] = total_uncertainty
        
        return uncertainties
    
    async def _infer_causal_links(self, readings: List[SensorReading]) -> Dict[str, List[str]]:
        """Infer causal relationships between sensor readings"""
        causal_links = {}
        
        try:
            # Use simple correlation-based causal inference (can be enhanced with proper causal discovery)
            if len(readings) >= 2:
                # Create feature vector from readings
                feature_vector = []
                sensor_ids = []
                
                for reading in readings:
                    if isinstance(reading.value, (int, float)):
                        feature_vector.append(reading.value)
                        sensor_ids.append(reading.sensor_id)
                    elif isinstance(reading.value, list) and all(isinstance(x, (int, float)) for x in reading.value):
                        feature_vector.extend(reading.value[:3])  # Take first 3 dimensions
                        sensor_ids.extend([f"{reading.sensor_id}_{i}" for i in range(min(3, len(reading.value)))])
                
                # Simple causal inference based on temporal ordering and correlation
                if len(feature_vector) > 1:
                    # Use neural causal model if we have enough data
                    if hasattr(self, 'causal_model') and len(feature_vector) >= 8:
                        input_tensor = torch.tensor(feature_vector[:8], dtype=torch.float32).unsqueeze(0)
                        with torch.no_grad():
                            effects, uncertainty, causal_adj = self.causal_model(input_tensor)
                            
                        # Extract causal links from adjacency matrix
                        causal_adj_np = causal_adj.squeeze(0).numpy()
                        threshold = 0.5
                        
                        for i in range(min(len(sensor_ids), causal_adj_np.shape[0])):
                            for j in range(min(len(sensor_ids), causal_adj_np.shape[1])):
                                if i != j and causal_adj_np[i, j] > threshold:
                                    if sensor_ids[i] not in causal_links:
                                        causal_links[sensor_ids[i]] = []
                                    causal_links[sensor_ids[i]].append(sensor_ids[j])
        
        except Exception as e:
            logger.error(f"Error inferring causal links: {e}")
        
        return causal_links
    
    async def _hypothesis_generation_loop(self):
        """Generate hypotheses about the physical world"""
        while self.active:
            try:
                if len(self.active_hypotheses) < 10:  # Maintain up to 10 active hypotheses
                    hypothesis = await self._generate_hypothesis()
                    if hypothesis:
                        self.active_hypotheses.append(hypothesis)
                        logger.info(f"Generated hypothesis: {hypothesis.description}")
                
                await asyncio.sleep(30.0)  # Generate new hypothesis every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in hypothesis generation loop: {e}")
                await asyncio.sleep(60.0)
    
    async def _generate_hypothesis(self) -> Optional[PhysicalHypothesis]:
        """Generate a testable hypothesis about the physical world"""
        try:
            # Base hypothesis on current world state and observations
            if not self.current_world_state.sensor_readings:
                return None
            
            # Simple hypothesis generation based on sensor patterns
            hypothesis_types = [
                "temperature_stability",
                "motion_correlation", 
                "location_dependency",
                "actuator_effect",
                "sensor_correlation"
            ]
            
            hypothesis_type = np.random.choice(hypothesis_types)
            
            if hypothesis_type == "temperature_stability":
                return PhysicalHypothesis(
                    hypothesis_id=f"temp_stable_{int(time.time())}",
                    description="Ambient temperature remains stable over 5-minute intervals",
                    prediction={"temperature_change": {"max": 1.0}},
                    test_conditions={"duration": 300, "sampling_rate": 1.0},
                    expected_outcome={"temperature_variance": {"range": [0.0, 1.0]}},
                    confidence=0.7,
                    created_at=datetime.now()
                )
            
            elif hypothesis_type == "actuator_effect":
                return PhysicalHypothesis(
                    hypothesis_id=f"servo_effect_{int(time.time())}",
                    description="Moving servo affects accelerometer readings",
                    prediction={"acceleration_change": {"direction": "increase"}},
                    test_conditions={"servo_movement": {"manipulate": [0, 90, 180], "actuator": "servo_1"}},
                    expected_outcome={"acceleration_magnitude": {"range": [0.1, 5.0], "sensor": "accel_main"}},
                    confidence=0.6,
                    created_at=datetime.now()
                )
            
            # Add more hypothesis generation logic as needed...
            
        except Exception as e:
            logger.error(f"Error generating hypothesis: {e}")
            return None
    
    async def _causal_learning_loop(self):
        """Continuously learn causal relationships"""
        while self.active:
            try:
                if self.learning_enabled and len(self.current_world_state.sensor_readings) > 0:
                    await self._update_causal_model()
                    await self._update_world_model()
                
                await asyncio.sleep(60.0)  # Update models every minute
                
            except Exception as e:
                logger.error(f"Error in causal learning loop: {e}")
                await asyncio.sleep(120.0)
    
    async def _update_causal_model(self):
        """Update causal model with recent observations"""
        try:
            # Collect recent sensor data for training
            # This is a simplified version - in practice, you'd maintain a proper dataset
            if len(self.current_world_state.sensor_readings) >= 8:
                feature_vector = []
                for reading in self.current_world_state.sensor_readings[:8]:
                    if isinstance(reading.value, (int, float)):
                        feature_vector.append(reading.value)
                    elif isinstance(reading.value, list):
                        feature_vector.append(reading.value[0] if reading.value else 0.0)
                    else:
                        feature_vector.append(0.0)
                
                # Pad or truncate to correct size
                feature_vector = feature_vector[:128]
                while len(feature_vector) < 128:
                    feature_vector.append(0.0)
                
                input_tensor = torch.tensor(feature_vector, dtype=torch.float32).unsqueeze(0)
                
                # Simple self-supervised update (in practice, use proper training data)
                with torch.no_grad():
                    effects, uncertainty, causal_adj = self.causal_model(input_tensor)
                    # Update could involve comparing predictions with actual outcomes
                    
        except Exception as e:
            logger.error(f"Error updating causal model: {e}")
    
    async def _update_world_model(self):
        """Update world dynamics model"""
        try:
            # Update world model with recent state transitions
            # This is a placeholder for proper world model training
            logger.debug("World model update (placeholder)")
            
        except Exception as e:
            logger.error(f"Error updating world model: {e}")
    
    async def test_hypothesis(self, hypothesis_id: str) -> Optional[Dict[str, Any]]:
        """Test a specific hypothesis"""
        hypothesis = next((h for h in self.active_hypotheses if h.hypothesis_id == hypothesis_id), None)
        if not hypothesis:
            logger.error(f"Hypothesis not found: {hypothesis_id}")
            return None
        
        result = await self.hypothesis_validator.test_hypothesis(hypothesis)
        
        # Move tested hypothesis to validated list
        if hypothesis in self.active_hypotheses:
            self.active_hypotheses.remove(hypothesis)
            self.validated_hypotheses.append(hypothesis)
        
        return result
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        return {
            'system_active': self.active,
            'azure_connected': self.azure_iot_client is not None,
            'sensors': {
                'registered': len(self.sensor_manager.sensors),
                'active': sum(1 for s in self.sensor_manager.sensors.values() if s['active']),
                'last_readings': len(self.current_world_state.sensor_readings)
            },
            'actuators': {
                'registered': len(self.actuator_manager.actuators),
                'active': sum(1 for a in self.actuator_manager.actuators.values() if a['active'])
            },
            'hypotheses': {
                'active': len(self.active_hypotheses),
                'validated': len(self.validated_hypotheses),
                'success_rate': len([h for h in self.validated_hypotheses if h.results and h.results.get('hypothesis_supported', False)]) / max(1, len(self.validated_hypotheses))
            },
            'world_state': {
                'last_update': self.current_world_state.timestamp.isoformat(),
                'derived_properties': len(self.current_world_state.derived_properties),
                'uncertainty_level': np.mean(list(self.current_world_state.uncertainty_map.values())) if self.current_world_state.uncertainty_map else 0.0,
                'causal_links': sum(len(links) for links in self.current_world_state.causal_links.values())
            }
        }
    
    async def shutdown(self):
        """Gracefully shutdown the system"""
        logger.info("Shutting down Reality Grounding System...")
        self.active = False
        
        if self.azure_iot_client:
            await self.azure_iot_client.disconnect()
        
        logger.info("Reality Grounding System shutdown complete")

async def create_reality_grounding_system(azure_connection_string: Optional[str] = None) -> RealityGroundingSystem:
    """Factory function to create and initialize reality grounding system"""
    system = RealityGroundingSystem(azure_connection_string=azure_connection_string)
    await system.initialize()
    return system

# Example usage and testing
if __name__ == "__main__":
    async def demo_reality_grounding():
        """Demonstrate reality grounding system capabilities"""
        logger.info("🌍 RomAI Reality Grounding System Demo")
        logger.info("=" * 50)
        
        # Create and initialize system
        system = await create_reality_grounding_system()
        
        try:
            # Run system for demo period
            logger.info("System running... (demo will run for 2 minutes)")
            
            # Let system run and generate hypotheses
            await asyncio.sleep(30)
            
            # Test a hypothesis if any were generated
            if system.active_hypotheses:
                hypothesis = system.active_hypotheses[0]
                logger.info(f"Testing hypothesis: {hypothesis.description}")
                result = await system.test_hypothesis(hypothesis.hypothesis_id)
                logger.info(f"Hypothesis test result: {result}")
            
            # Show system status
            await asyncio.sleep(30)
            status = await system.get_system_status()
            logger.info("System Status:")
            logger.info(json.dumps(status, indent=2, default=str))
            
            # Run for additional time to demonstrate continuous operation
            await asyncio.sleep(60)
            
        finally:
            await system.shutdown()
    
    # Run the demo
    asyncio.run(demo_reality_grounding())