import {
  type EnrollmentType,
  type GuardianRelation,
  type InsuranceType,
  type NotificationChannel,
  type PrismaClient,
  type Sex,
  type Shift,
  type StudentStatus,
} from '@prisma/client';

// Fecha UTC a medianoche (columnas @db.Date).
const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));
const ENROLLED_AT = d(2026, 3, 2);

// ===== Apoderados (A-0201 .. A-0225) =====

type GuardianSeed = {
  fullName: string;
  dni: string;
  phone: string;
  email: string | null;
  address: string;
  notificationChannel: NotificationChannel;
};

const GUARDIANS: GuardianSeed[] = [
  { fullName: 'María Quispe Mamani', dni: '70200001', phone: '964200001', email: 'maria.quispe@gmail.com', address: 'Jr. Los Cedros 120, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'José Rojas Huamán', dni: '70200002', phone: '964200002', email: 'jose.rojas@gmail.com', address: 'Jr. Los Cedros 120, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'Rosa Huamán Flores', dni: '70200003', phone: '964200003', email: 'rosa.huaman@gmail.com', address: 'Av. Marginal 340, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'Luis Vela Torres', dni: '70200004', phone: '964200004', email: null, address: 'Av. Marginal 340, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'Carmen Ccopa Mamani', dni: '70200005', phone: '964200005', email: 'carmen.ccopa@gmail.com', address: 'Jr. Colonos 88, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'Pedro Mamani Quispe', dni: '70200006', phone: '964200006', email: null, address: 'Jr. Colonos 88, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'Juana Flores Rojas', dni: '70200007', phone: '964200007', email: 'juana.flores@gmail.com', address: 'Jr. Amazonas 215, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'Miguel Torres Paredes', dni: '70200008', phone: '964200008', email: 'miguel.torres@gmail.com', address: 'Jr. Amazonas 215, Satipo', notificationChannel: 'SOLO_CORREO' },
  { fullName: 'Ana Paredes Chávez', dni: '70200009', phone: '964200009', email: 'ana.paredes@gmail.com', address: 'Av. Los Incas 460, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'Jorge Chávez Vela', dni: '70200010', phone: '964200010', email: null, address: 'Av. Los Incas 460, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'Silvia Vela Ccopa', dni: '70200011', phone: '964200011', email: 'silvia.vela@gmail.com', address: 'Jr. San Martín 77, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'Raúl Huamán Rojas', dni: '70200012', phone: '964200012', email: 'raul.huaman@gmail.com', address: 'Jr. San Martín 77, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'Elena Rojas Quispe', dni: '70200013', phone: '964200013', email: 'elena.rojas@gmail.com', address: 'Jr. Bolognesi 132, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'Víctor Mamani Flores', dni: '70200014', phone: '964200014', email: null, address: 'Jr. Bolognesi 132, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'Gloria Torres Huamán', dni: '70200015', phone: '964200015', email: 'gloria.torres@gmail.com', address: 'Av. Perené 501, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'Fernando Paredes Rojas', dni: '70200016', phone: '964200016', email: null, address: 'Av. Perené 501, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'Nilda Chávez Mamani', dni: '70200017', phone: '964200017', email: 'nilda.chavez@gmail.com', address: 'Jr. Grau 210, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'Óscar Flores Vela', dni: '70200018', phone: '964200018', email: 'oscar.flores@gmail.com', address: 'Jr. Tarma 44, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'Yola Quispe Torres', dni: '70200019', phone: '964200019', email: null, address: 'Av. Circunvalación 610, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'César Vela Paredes', dni: '70200020', phone: '964200020', email: 'cesar.vela@gmail.com', address: 'Jr. Junín 158, Satipo', notificationChannel: 'SOLO_CORREO' },
  { fullName: 'Marta Huamán Ccopa', dni: '70200021', phone: '964200021', email: 'marta.huaman@gmail.com', address: 'Jr. Lima 92, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'Julio Rojas Chávez', dni: '70200022', phone: '964200022', email: null, address: 'Av. Marginal 720, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'Delia Mamani Rojas', dni: '70200023', phone: '964200023', email: 'delia.mamani@gmail.com', address: 'Jr. Ucayali 305, Satipo', notificationChannel: 'WHATSAPP_Y_CORREO' },
  { fullName: 'Hugo Ccopa Huamán', dni: '70200024', phone: '964200024', email: 'hugo.ccopa@gmail.com', address: 'Jr. Ayacucho 66, Satipo', notificationChannel: 'SOLO_WHATSAPP' },
  { fullName: 'Betty Torres Flores', dni: '70200025', phone: '964200025', email: null, address: 'Av. Los Colonos 411, Satipo', notificationChannel: 'NINGUNO' },
];

// ===== Estudiantes (E-1001 .. E-1040) =====

type Placement = { level: string; grade: string; section: string };
type GLink = { gi: number; relation: GuardianRelation; isPrimary: boolean };
type StudentSeed = {
  firstNames: string;
  paternalLastName: string;
  maternalLastName?: string;
  dni: string;
  sex: Sex;
  birth: [number, number, number];
  address: string;
  placement: Placement | null;
  status: StudentStatus;
  type: EnrollmentType;
  insuranceType?: InsuranceType;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  authorizedPickups?: { name: string; dni?: string; relation: string }[];
  withdrawalReason?: string;
  withdrawnAt?: [number, number, number];
  guardians: GLink[];
};

// Atajos de vínculos familiares.
const parents = (motherGi: number, fatherGi: number): GLink[] => [
  { gi: motherGi, relation: 'MADRE', isPrimary: true },
  { gi: fatherGi, relation: 'PADRE', isPrimary: false },
];
const single = (gi: number, relation: GuardianRelation): GLink[] => [
  { gi, relation, isPrimary: true },
];

const P = (level: string, grade: string, section: string): Placement => ({ level, grade, section });

const STUDENTS: StudentSeed[] = [
  // F1 · Rojas Quispe (María Quispe + José Rojas)
  { firstNames: 'Diego', paternalLastName: 'Rojas', maternalLastName: 'Quispe', dni: '70100001', sex: 'M', birth: [2011, 5, 12], address: 'Jr. Los Cedros 120, Satipo', placement: P('Secundaria', '3°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', insuranceType: 'SIS', emergencyContactName: 'María Quispe Mamani', emergencyContactPhone: '964200001', authorizedPickups: [{ name: 'María Quispe Mamani', dni: '70200001', relation: 'Madre' }], guardians: parents(0, 1) },
  { firstNames: 'Camila', paternalLastName: 'Rojas', maternalLastName: 'Quispe', dni: '70100002', sex: 'F', birth: [2015, 8, 3], address: 'Jr. Los Cedros 120, Satipo', placement: P('Primaria', '5°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', guardians: parents(0, 1) },
  { firstNames: 'Mateo', paternalLastName: 'Rojas', maternalLastName: 'Quispe', dni: '70100003', sex: 'M', birth: [2018, 2, 20], address: 'Jr. Los Cedros 120, Satipo', placement: P('Primaria', '2°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', allergies: 'Penicilina', insuranceType: 'SIS', emergencyContactName: 'José Rojas Huamán', emergencyContactPhone: '964200002', guardians: parents(0, 1) },

  // F2 · Vela Huamán (Rosa Huamán + Luis Vela)
  { firstNames: 'Valentina', paternalLastName: 'Vela', maternalLastName: 'Huamán', dni: '70100004', sex: 'F', birth: [2013, 4, 9], address: 'Av. Marginal 340, Satipo', placement: P('Secundaria', '1°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', insuranceType: 'ESSALUD', guardians: parents(2, 3) },
  { firstNames: 'Sebastián', paternalLastName: 'Vela', maternalLastName: 'Huamán', dni: '70100005', sex: 'M', birth: [2014, 11, 27], address: 'Av. Marginal 340, Satipo', placement: P('Primaria', '6°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', guardians: parents(2, 3) },
  { firstNames: 'Micaela', paternalLastName: 'Vela', maternalLastName: 'Huamán', dni: '70100006', sex: 'F', birth: [2017, 6, 15], address: 'Av. Marginal 340, Satipo', placement: P('Primaria', '3°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', guardians: parents(2, 3) },

  // F3 · Mamani Ccopa (Carmen Ccopa + Pedro Mamani)
  { firstNames: 'Adriana', paternalLastName: 'Mamani', maternalLastName: 'Ccopa', dni: '70100007', sex: 'F', birth: [2016, 1, 30], address: 'Jr. Colonos 88, Satipo', placement: P('Primaria', '4°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', emergencyContactName: 'Carmen Ccopa Mamani', emergencyContactPhone: '964200005', authorizedPickups: [{ name: 'Carmen Ccopa Mamani', dni: '70200005', relation: 'Madre' }, { name: 'Rosa Vera Ccopa', relation: 'Tía' }], guardians: parents(4, 5) },
  { firstNames: 'Fabricio', paternalLastName: 'Mamani', maternalLastName: 'Ccopa', dni: '70100008', sex: 'M', birth: [2020, 9, 5], address: 'Jr. Colonos 88, Satipo', placement: P('Inicial', '5 años', 'Las Estrellitas'), status: 'ACTIVO', type: 'NUEVA', guardians: parents(4, 5) },

  // F4 · Torres Flores (Juana Flores + Miguel Torres)
  { firstNames: 'Luciana', paternalLastName: 'Torres', maternalLastName: 'Flores', dni: '70100009', sex: 'F', birth: [2012, 3, 18], address: 'Jr. Amazonas 215, Satipo', placement: P('Secundaria', '2°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', allergies: 'Maní', insuranceType: 'ESSALUD', emergencyContactName: 'Juana Flores Rojas', emergencyContactPhone: '964200007', guardians: parents(6, 7) },
  { firstNames: 'Thiago', paternalLastName: 'Torres', maternalLastName: 'Flores', dni: '70100010', sex: 'M', birth: [2019, 7, 22], address: 'Jr. Amazonas 215, Satipo', placement: P('Primaria', '1°', 'A'), status: 'ACTIVO', type: 'NUEVA', guardians: parents(6, 7) },

  // F5 · Chávez Paredes (Ana Paredes + Jorge Chávez)
  { firstNames: 'Emilia', paternalLastName: 'Chávez', maternalLastName: 'Paredes', dni: '70100011', sex: 'F', birth: [2014, 10, 2], address: 'Av. Los Incas 460, Satipo', placement: P('Primaria', '6°', 'B'), status: 'ACTIVO', type: 'RATIFICADA', guardians: parents(8, 9) },
  { firstNames: 'Benjamín', paternalLastName: 'Chávez', maternalLastName: 'Paredes', dni: '70100012', sex: 'M', birth: [2016, 12, 11], address: 'Av. Los Incas 460, Satipo', placement: P('Primaria', '4°', 'B'), status: 'ACTIVO', type: 'RATIFICADA', guardians: parents(8, 9) },

  // F6 · Huamán Vela (Silvia Vela + Raúl Huamán)
  { firstNames: 'Antonella', paternalLastName: 'Huamán', maternalLastName: 'Vela', dni: '70100013', sex: 'F', birth: [2009, 2, 14], address: 'Jr. San Martín 77, Satipo', placement: P('Secundaria', '5°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', insuranceType: 'PRIVADO', authorizedPickups: [{ name: 'Silvia Vela Ccopa', dni: '70200011', relation: 'Madre' }], guardians: parents(10, 11) },
  { firstNames: 'Gabriel', paternalLastName: 'Huamán', maternalLastName: 'Vela', dni: '70100014', sex: 'M', birth: [2012, 5, 25], address: 'Jr. San Martín 77, Satipo', placement: P('Secundaria', '2°', 'B'), status: 'ACTIVO', type: 'RATIFICADA', allergies: 'Polen', insuranceType: 'PRIVADO', guardians: parents(10, 11) },
  { firstNames: 'Isabella', paternalLastName: 'Huamán', maternalLastName: 'Vela', dni: '70100015', sex: 'F', birth: [2017, 8, 8], address: 'Jr. San Martín 77, Satipo', placement: P('Primaria', '3°', 'B'), status: 'ACTIVO', type: 'RATIFICADA', guardians: parents(10, 11) },

  // F7 · Mamani Rojas (Elena Rojas + Víctor Mamani)
  { firstNames: 'Joaquín', paternalLastName: 'Mamani', maternalLastName: 'Rojas', dni: '70100016', sex: 'M', birth: [2015, 3, 1], address: 'Jr. Bolognesi 132, Satipo', placement: P('Primaria', '5°', 'B'), status: 'ACTIVO', type: 'RATIFICADA', guardians: parents(12, 13) },
  { firstNames: 'Renata', paternalLastName: 'Mamani', maternalLastName: 'Rojas', dni: '70100017', sex: 'F', birth: [2021, 6, 19], address: 'Jr. Bolognesi 132, Satipo', placement: P('Inicial', '4 años', 'Los Girasoles'), status: 'ACTIVO', type: 'NUEVA', guardians: parents(12, 13) },

  // F8 · Paredes Torres (Gloria Torres + Fernando Paredes)
  { firstNames: 'Ariana', paternalLastName: 'Paredes', maternalLastName: 'Torres', dni: '70100018', sex: 'F', birth: [2010, 9, 30], address: 'Av. Perené 501, Satipo', placement: P('Secundaria', '4°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', guardians: parents(14, 15) },
  { firstNames: 'Dylan', paternalLastName: 'Paredes', maternalLastName: 'Torres', dni: '70100019', sex: 'M', birth: [2018, 4, 7], address: 'Av. Perené 501, Satipo', placement: P('Primaria', '2°', 'B'), status: 'ACTIVO', type: 'RATIFICADA', guardians: parents(14, 15) },

  // F9 · Chávez Ríos (Nilda Chávez, madre)
  { firstNames: 'Alessandro', paternalLastName: 'Chávez', maternalLastName: 'Ríos', dni: '70100020', sex: 'M', birth: [2013, 7, 3], address: 'Jr. Grau 210, Satipo', placement: P('Secundaria', '1°', 'B'), status: 'ACTIVO', type: 'NUEVA', guardians: single(16, 'MADRE') },
  { firstNames: 'Valeria', paternalLastName: 'Chávez', maternalLastName: 'Ríos', dni: '70100021', sex: 'F', birth: [2016, 5, 16], address: 'Jr. Grau 210, Satipo', placement: P('Primaria', '4°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', guardians: single(16, 'MADRE') },
  { firstNames: 'Fabiana', paternalLastName: 'Chávez', maternalLastName: 'Ríos', dni: '70100022', sex: 'F', birth: [2020, 11, 21], address: 'Jr. Grau 210, Satipo', placement: P('Inicial', '5 años', 'Los Delfines'), status: 'BECADO', type: 'NUEVA', allergies: 'Lactosa', insuranceType: 'SIS', emergencyContactName: 'Nilda Chávez Mamani', emergencyContactPhone: '964200017', guardians: single(16, 'MADRE') },

  // F10 · Flores Díaz (Óscar Flores, padre)
  { firstNames: 'Santiago', paternalLastName: 'Flores', maternalLastName: 'Díaz', dni: '70100023', sex: 'M', birth: [2011, 1, 9], address: 'Jr. Tarma 44, Satipo', placement: P('Secundaria', '3°', 'B'), status: 'ACTIVO', type: 'NUEVA', guardians: single(17, 'PADRE') },
  { firstNames: 'Bianca', paternalLastName: 'Flores', maternalLastName: 'Díaz', dni: '70100024', sex: 'F', birth: [2019, 3, 28], address: 'Jr. Tarma 44, Satipo', placement: P('Primaria', '1°', 'B'), status: 'ACTIVO', type: 'NUEVA', guardians: single(17, 'PADRE') },

  // F11 · Quispe Salas (Yola Quispe, madre)
  { firstNames: 'Mía', paternalLastName: 'Quispe', maternalLastName: 'Salas', dni: '70100025', sex: 'F', birth: [2017, 10, 4], address: 'Av. Circunvalación 610, Satipo', placement: P('Primaria', '3°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', guardians: single(18, 'MADRE') },
  { firstNames: 'Liam', paternalLastName: 'Quispe', maternalLastName: 'Salas', dni: '70100026', sex: 'M', birth: [2022, 5, 13], address: 'Av. Circunvalación 610, Satipo', placement: P('Inicial', '3 años', 'Los Pollitos'), status: 'ACTIVO', type: 'NUEVA', guardians: single(18, 'MADRE') },

  // F12 · Vela Ninanya (César Vela, padre)
  { firstNames: 'Zoe', paternalLastName: 'Vela', maternalLastName: 'Ninanya', dni: '70100027', sex: 'F', birth: [2009, 8, 17], address: 'Jr. Junín 158, Satipo', placement: P('Secundaria', '5°', 'B'), status: 'ACTIVO', type: 'RATIFICADA', guardians: single(19, 'PADRE') },
  { firstNames: 'Aarón', paternalLastName: 'Vela', maternalLastName: 'Ninanya', dni: '70100028', sex: 'M', birth: [2015, 2, 6], address: 'Jr. Junín 158, Satipo', placement: P('Primaria', '5°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', guardians: single(19, 'PADRE') },

  // F13 · Soto Huamán (Marta Huamán, abuela/tutora)
  { firstNames: 'Nicolás', paternalLastName: 'Soto', maternalLastName: 'Huamán', dni: '70100029', sex: 'M', birth: [2012, 12, 24], address: 'Jr. Lima 92, Satipo', placement: P('Secundaria', '2°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', guardians: single(20, 'ABUELO_A') },
  { firstNames: 'Julieta', paternalLastName: 'Soto', maternalLastName: 'Huamán', dni: '70100030', sex: 'F', birth: [2016, 7, 11], address: 'Jr. Lima 92, Satipo', placement: P('Primaria', '4°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', allergies: 'Mariscos', insuranceType: 'ESSALUD', emergencyContactName: 'Marta Huamán Ccopa', emergencyContactPhone: '964200021', guardians: single(20, 'ABUELO_A') },

  // F14 · Rojas Vega (Julio Rojas, padre)
  { firstNames: 'Matías', paternalLastName: 'Rojas', maternalLastName: 'Vega', dni: '70100031', sex: 'M', birth: [2010, 6, 2], address: 'Av. Marginal 720, Satipo', placement: P('Secundaria', '4°', 'B'), status: 'ACTIVO', type: 'RATIFICADA', guardians: single(21, 'PADRE') },
  { firstNames: 'Alessia', paternalLastName: 'Rojas', maternalLastName: 'Vega', dni: '70100032', sex: 'F', birth: [2014, 9, 15], address: 'Av. Marginal 720, Satipo', placement: P('Primaria', '6°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', guardians: single(21, 'PADRE') },
  { firstNames: 'Gael', paternalLastName: 'Rojas', maternalLastName: 'Vega', dni: '70100033', sex: 'M', birth: [2018, 11, 8], address: 'Av. Marginal 720, Satipo', placement: P('Primaria', '2°', 'A'), status: 'ACTIVO', type: 'RATIFICADA', guardians: single(21, 'PADRE') },

  // F15 · Mamani León (Delia Mamani, madre)
  { firstNames: 'Alondra', paternalLastName: 'Mamani', maternalLastName: 'León', dni: '70100034', sex: 'F', birth: [2013, 3, 20], address: 'Jr. Ucayali 305, Satipo', placement: P('Secundaria', '1°', 'A'), status: 'ACTIVO', type: 'NUEVA', guardians: single(22, 'MADRE') },
  { firstNames: 'Facundo', paternalLastName: 'Mamani', maternalLastName: 'León', dni: '70100035', sex: 'M', birth: [2019, 1, 12], address: 'Jr. Ucayali 305, Satipo', placement: null, status: 'RESERVADO', type: 'NUEVA', guardians: single(22, 'MADRE') },

  // F16 · Ccopa Vera (Hugo Ccopa, padre)
  { firstNames: 'Maite', paternalLastName: 'Ccopa', maternalLastName: 'Vera', dni: '70100036', sex: 'F', birth: [2015, 4, 26], address: 'Jr. Ayacucho 66, Satipo', placement: P('Primaria', '5°', 'B'), status: 'ACTIVO', type: 'RATIFICADA', guardians: single(23, 'PADRE') },
  { firstNames: 'Bruno', paternalLastName: 'Ccopa', maternalLastName: 'Vera', dni: '70100037', sex: 'M', birth: [2017, 9, 3], address: 'Jr. Ayacucho 66, Satipo', placement: P('Primaria', '3°', 'A'), status: 'ACTIVO', type: 'NUEVA', guardians: single(23, 'PADRE') },

  // F17 · Torres Salas (Betty Torres, madre)
  { firstNames: 'Catalina', paternalLastName: 'Torres', maternalLastName: 'Salas', dni: '70100038', sex: 'F', birth: [2011, 7, 19], address: 'Av. Los Colonos 411, Satipo', placement: P('Secundaria', '3°', 'A'), status: 'BECADO', type: 'RATIFICADA', guardians: single(24, 'MADRE') },
  { firstNames: 'Iker', paternalLastName: 'Torres', maternalLastName: 'Salas', dni: '70100039', sex: 'M', birth: [2016, 2, 28], address: 'Av. Los Colonos 411, Satipo', placement: P('Primaria', '4°', 'B'), status: 'ACTIVO', type: 'RATIFICADA', guardians: single(24, 'MADRE') },
  {
    firstNames: 'Amanda', paternalLastName: 'Torres', maternalLastName: 'Salas', dni: '70100040', sex: 'F', birth: [2018, 5, 10],
    address: 'Av. Los Colonos 411, Satipo', placement: P('Primaria', '2°', 'A'),
    status: 'TRASLADADO', type: 'RATIFICADA',
    withdrawalReason: 'Traslado a otra ciudad por motivos laborales de la familia',
    withdrawnAt: [2026, 4, 15],
    guardians: single(24, 'MADRE'),
  },
];

// Turno del estudiante = turno de su sección (1° B de Primaria y 4° B de Secundaria van en la tarde).
function placementShift(p: Placement | null): Shift | null {
  if (!p) return null;
  if (p.section === 'B' && p.level === 'Primaria' && p.grade === '1°') return 'TARDE';
  if (p.section === 'B' && p.level === 'Secundaria' && p.grade === '4°') return 'TARDE';
  return 'MANANA';
}

export async function seedStudentsGuardians(prisma: PrismaClient) {
  const year2026 = await prisma.academicYear.findUnique({ where: { name: '2026' } });
  if (!year2026) throw new Error('Falta el año 2026 — corre primero el seed 04-academic-years');

  const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!admin) throw new Error('Falta el usuario admin — corre primero el seed 02-users');

  // Mapa de secciones 2026: "Nivel|Grado|Sección" → id (ignora el nivel TEST del usuario si existe).
  const sections = await prisma.section.findMany({
    where: { gradeLevel: { level: { academicYearId: year2026.id } } },
    select: {
      id: true,
      name: true,
      gradeLevel: { select: { name: true, level: { select: { name: true } } } },
    },
  });
  const sectionMap = new Map<string, string>();
  for (const s of sections) {
    sectionMap.set(`${s.gradeLevel.level.name}|${s.gradeLevel.name}|${s.name}`, s.id);
  }
  const resolveSection = (p: Placement): string => {
    const id = sectionMap.get(`${p.level}|${p.grade}|${p.section}`);
    if (!id) throw new Error(`Sección no encontrada en 2026: ${p.level} · ${p.grade} · ${p.section}`);
    return id;
  };

  // ----- Apoderados -----
  const guardianIds: string[] = [];
  for (let i = 0; i < GUARDIANS.length; i++) {
    const g = GUARDIANS[i]!;
    const code = `A-${String(201 + i).padStart(4, '0')}`;
    const row = await prisma.guardian.upsert({
      where: { dni: g.dni },
      update: {},
      create: {
        code,
        fullName: g.fullName,
        dni: g.dni,
        phone: g.phone,
        email: g.email,
        address: g.address,
        notificationChannel: g.notificationChannel,
      },
    });
    guardianIds.push(row.id);
  }
  const gid = (i: number): string => {
    const id = guardianIds[i];
    if (!id) throw new Error(`Apoderado ${i} no sembrado`);
    return id;
  };

  // ----- Estudiantes + vínculos + matrículas -----
  let enrollSeq = 0;
  for (let i = 0; i < STUDENTS.length; i++) {
    const s = STUDENTS[i]!;
    const code = `E-${String(1001 + i).padStart(4, '0')}`;
    const sectionId = s.placement ? resolveSection(s.placement) : null;

    const student = await prisma.student.upsert({
      where: { dni: s.dni },
      update: {},
      create: {
        code,
        firstNames: s.firstNames,
        paternalLastName: s.paternalLastName,
        maternalLastName: s.maternalLastName ?? null,
        dni: s.dni,
        birthDate: d(...s.birth),
        sex: s.sex,
        address: s.address,
        status: s.status,
        shift: placementShift(s.placement),
        allergies: s.allergies ?? null,
        insuranceType: s.insuranceType ?? 'NINGUNO',
        emergencyContactName: s.emergencyContactName ?? null,
        emergencyContactPhone: s.emergencyContactPhone ?? null,
        authorizedPickups: s.authorizedPickups ?? [],
        withdrawalReason: s.withdrawalReason ?? null,
        withdrawnAt: s.withdrawnAt ? d(...s.withdrawnAt) : null,
      },
    });

    // Vínculos N:M (exactamente un isPrimary por estudiante, garantizado por los datos).
    for (const l of s.guardians) {
      await prisma.studentGuardian.upsert({
        where: { studentId_guardianId: { studentId: student.id, guardianId: gid(l.gi) } },
        update: {},
        create: {
          studentId: student.id,
          guardianId: gid(l.gi),
          relation: l.relation,
          isPrimary: l.isPrimary,
          active: true,
        },
      });
    }

    // Matrícula 2026 para todos menos el RESERVADO. El TRASLADADO lleva su matrícula anulada.
    if (s.placement && sectionId && s.status !== 'RESERVADO') {
      enrollSeq += 1;
      const enrollmentCode = `M-2026-${String(enrollSeq).padStart(4, '0')}`;
      const primary = s.guardians.find((g) => g.isPrimary) ?? s.guardians[0]!;
      const canceled = s.status === 'RETIRADO' || s.status === 'TRASLADADO';
      const cancelReason = canceled
        ? `${s.status === 'RETIRADO' ? 'Retiro' : 'Traslado'}: ${s.withdrawalReason ?? ''}`
        : null;

      await prisma.enrollment.upsert({
        where: { code: enrollmentCode },
        update: {},
        create: {
          code: enrollmentCode,
          studentId: student.id,
          sectionId,
          academicYearId: year2026.id,
          type: s.type,
          status: 'COMPLETA',
          signingGuardianId: gid(primary.gi),
          registeredById: admin.id,
          enrolledAt: ENROLLED_AT,
          canceledAt: canceled ? d(2026, 4, 15) : null,
          cancelReason,
        },
      });
    }
  }

  // ----- Secuencias de códigos (marca de agua para que la API continúe la numeración) -----
  // Solo SUBEN: un re-seed nunca debe retroceder un contador que ya avanzó por uso real
  // de la API (retrocederlo produce colisiones "Registro duplicado" en los correlativos).
  const counters: [string, number][] = [
    ['student', 1000 + STUDENTS.length],
    ['guardian', 200 + GUARDIANS.length],
    [`enrollment:${year2026.name}`, enrollSeq],
  ];
  for (const [key, value] of counters) {
    const current = await prisma.codeCounter.findUnique({ where: { key } });
    const next = Math.max(current?.value ?? 0, value);
    await prisma.codeCounter.upsert({
      where: { key },
      update: { value: next },
      create: { key, value: next },
    });
  }

  console.log(
    `  ✓ ${STUDENTS.length} estudiantes, ${GUARDIANS.length} apoderados, ${enrollSeq} matrículas 2026 (1 anulada)`,
  );
}
