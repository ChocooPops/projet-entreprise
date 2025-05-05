import * as bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password1234', 10);

    // Create DIRECTOR
    const director = await prisma.user.create({
        data: {
            email: 'rahmaninahil@gmail.com',
            lastName: 'Nahil',
            firstName: 'RAHMANI',
            password: hashedPassword,
            role: 'DIRECTOR',
        },
    });

    // Create MANAGERS and EMPLOYEES
    const additionalUsers = await Promise.all([
        prisma.user.create({
            data: {
                email: 'alice.manager@gmail.com',
                firstName: 'Alice',
                lastName: 'Dupont',
                password: hashedPassword,
                role: 'MANAGER',
            },
        }),
        prisma.user.create({
            data: {
                email: 'bob.employee@gmail.com',
                firstName: 'Bob',
                lastName: 'Martin',
                password: hashedPassword,
                role: 'EMPLOYEE',
            },
        }),
        prisma.user.create({
            data: {
                email: 'carla.employee@gmail.com',
                firstName: 'Carla',
                lastName: 'Lopez',
                password: hashedPassword,
                role: 'EMPLOYEE',
            },
        }),
    ]);

    const allUsers = [director, ...additionalUsers];

    const projectsData = [
        {
            name: 'Intranet Redesign',
            description: 'Refonte complète de l’intranet entreprise',
            tasks: ['UI/UX Design', 'Mise en place de la base de données', 'Implémentation frontend', 'Tests QA'],
        },
        {
            name: 'CRM Migration',
            description: 'Migration du CRM vers un système plus moderne',
            tasks: ['Export des données', 'Nettoyage des doublons', 'Import dans nouveau CRM', 'Formation des équipes'],
        },
        {
            name: 'Mobile App V2',
            description: 'Deuxième version de l’application mobile',
            tasks: ['Définir les nouvelles features', 'Intégration API', 'Tests utilisateurs'],
        },
        {
            name: 'Campagne Marketing Été',
            description: 'Campagne pour promouvoir les produits d’été',
            tasks: ['Réalisation vidéos pub', 'Stratégie réseaux sociaux', 'Tracking de conversion'],
        },
        {
            name: 'Refonte Site Web',
            description: 'Nouveau site vitrine pour l’entreprise',
            tasks: ['Choix du CMS', 'Design maquettes', 'Mise en ligne'],
        },
        {
            name: 'Automatisation RH',
            description: 'Automatiser la gestion des congés',
            tasks: ['Analyse des besoins', 'Développement workflow', 'Tests'],
        },
        {
            name: 'Déploiement DevOps',
            description: 'Mise en place CI/CD avec GitHub Actions',
            tasks: ['Création des pipelines', 'Dockerisation', 'Monitoring'],
        },
        {
            name: 'Formation Sécurité',
            description: 'Sessions de formation à la sécurité informatique',
            tasks: ['Planification sessions', 'Création des supports', 'Suivi participation'],
        },
        {
            name: 'Projet R&D IA',
            description: 'Prototype d’outil d’analyse d’image par IA',
            tasks: ['Collecte de données', 'Entraînement du modèle', 'Évaluation des résultats'],
        },
        {
            name: 'Support Client 24/7',
            description: 'Mise en place d’un support client automatisé',
            tasks: ['Choix du chatbot', 'Configuration scénarios', 'Suivi satisfaction'],
        },
    ];

    for (const project of projectsData) {
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];

        const createdProject = await prisma.project.create({
            data: {
                name: project.name,
                description: project.description,
                assignedUsers: { connect: { id: randomUser.id } },
                tasks: {
                    create: project.tasks.map(title => ({
                        title,
                        status: 'TODO',
                        userId: randomUser.id,
                    })),
                },
                files: {
                    create: [
                        {
                            name: `Spécification - ${project.name}.pdf`,
                            url: `https://example.com/specs/${encodeURIComponent(project.name)}.pdf`,
                            type: 'pdf',
                            uploadedById: director.id
                        },
                        {
                            name: `Planning - ${project.name}.xlsx`,
                            url: `https://example.com/planning/${encodeURIComponent(project.name)}.xlsx`,
                            type: 'xlsx',
                            uploadedById: director.id
                        },
                    ],
                },
            },
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
