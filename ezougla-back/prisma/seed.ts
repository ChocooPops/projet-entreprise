import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password1234', 10);

    const director = await prisma.user.create({
        data: {
            email: 'rahmaninahil@gmail.com',
            lastName: 'Nahil',
            firstName: 'RAHMANI',
            password: hashedPassword,
            role: 'DIRECTOR',
            profilePhoto: 'uploads/user/user-0.png'
        },
    });

    const additionalUsers = await Promise.all([
        prisma.user.create({ data: { email: 'alice.manager@gmail.com', firstName: 'Alice', lastName: 'Dupont', password: hashedPassword, role: 'MANAGER', profilePhoto: 'uploads/user/user-2.png' } }),
        prisma.user.create({ data: { email: 'bob.employee@gmail.com', firstName: 'Bob', lastName: 'Martin', password: hashedPassword, role: 'EMPLOYEE', profilePhoto: 'uploads/user/user-1.png' } }),
        prisma.user.create({ data: { email: 'carla.employee@gmail.com', firstName: 'Carla', lastName: 'Lopez', password: hashedPassword, role: 'EMPLOYEE', profilePhoto: 'uploads/user/user-4.png' } }),
        prisma.user.create({ data: { email: 'david.manager@gmail.com', firstName: 'David', lastName: 'Durand', password: hashedPassword, role: 'MANAGER', profilePhoto: 'uploads/user/user-3.png' } }),
        prisma.user.create({ data: { email: 'emma.employee@gmail.com', firstName: 'Emma', lastName: 'Bernard', password: hashedPassword, role: 'EMPLOYEE', profilePhoto: 'uploads/user/user-6.png' } }),
        prisma.user.create({ data: { email: 'franck.employee@gmail.com', firstName: 'Franck', lastName: 'Petit', password: hashedPassword, role: 'EMPLOYEE', profilePhoto: 'uploads/user/user-5.png' } }),
        prisma.user.create({ data: { email: 'georgia.manager@gmail.com', firstName: 'Georgia', lastName: 'Fabre', password: hashedPassword, role: 'MANAGER', profilePhoto: 'uploads/user/user-6.png' } }),
        prisma.user.create({ data: { email: 'hugo.employee@gmail.com', firstName: 'Hugo', lastName: 'Lemoine', password: hashedPassword, role: 'EMPLOYEE', profilePhoto: 'uploads/user/user-7.png' } }),
        prisma.user.create({ data: { email: 'isabelle.employee@gmail.com', firstName: 'Isabelle', lastName: 'Moreau', password: hashedPassword, role: 'EMPLOYEE', profilePhoto: 'uploads/user/user-9.png' } }),
        prisma.user.create({ data: { email: 'julien.manager@gmail.com', firstName: 'Julien', lastName: 'Girard', password: hashedPassword, role: 'MANAGER', profilePhoto: 'uploads/user/user-8.png' } }),
        prisma.user.create({ data: { email: 'karim.employee@gmail.com', firstName: 'Karim', lastName: 'Benali', password: hashedPassword, role: 'EMPLOYEE', profilePhoto: 'uploads/user/user-3.png' } }),
        prisma.user.create({ data: { email: 'laura.employee@gmail.com', firstName: 'Laura', lastName: 'Collet', password: hashedPassword, role: 'EMPLOYEE', profilePhoto: 'uploads/user/user-10.png' } }),
        prisma.user.create({ data: { email: 'mathieu.manager@gmail.com', firstName: 'Mathieu', lastName: 'Chevalier', password: hashedPassword, role: 'MANAGER', profilePhoto: 'uploads/user/user-8.png' } }),
    ]);

    const allUsers = [director, ...additionalUsers];

    const projectsData = [
        {
            name: 'Intranet Redesign',
            description: 'Refonte complète de l’intranet entreprise',
            tasks: ['UI/UX Design', 'Mise en place de la base de données', 'Implémentation frontend', 'Tests QA'],
            srcBackground: 'uploads/projects/back-1.jpg'
        },
        {
            name: 'CRM Migration',
            description: 'Migration du CRM vers un système plus moderne',
            tasks: ['Export des données', 'Nettoyage des doublons', 'Import dans nouveau CRM', 'Formation des équipes'],
            srcBackground: 'uploads/projects/back-10.jpg'
        },
        {
            name: 'Mobile App V2',
            description: 'Deuxième version de l’application mobile',
            tasks: ['Définir les nouvelles features', 'Intégration API', 'Tests utilisateurs'],
            srcBackground: 'uploads/projects/back-3.jpg'
        },
        {
            name: 'Campagne Marketing Été',
            description: 'Campagne pour promouvoir les produits d’été',
            tasks: ['Réalisation vidéos pub', 'Stratégie réseaux sociaux', 'Tracking de conversion'],
            srcBackground: 'uploads/projects/back-7.jpg'
        },
        {
            name: 'Refonte Site Web',
            description: 'Nouveau site vitrine pour l’entreprise',
            tasks: ['Choix du CMS', 'Design maquettes', 'Mise en ligne'],
            srcBackground: 'uploads/projects/back-12.jpg'
        },
        {
            name: 'Automatisation RH',
            description: 'Automatiser la gestion des congés',
            tasks: ['Analyse des besoins', 'Développement workflow', 'Tests'],
            srcBackground: 'uploads/projects/back-11.jpg'
        },
        {
            name: 'Déploiement DevOps',
            description: 'Mise en place CI/CD avec GitHub Actions',
            tasks: ['Création des pipelines', 'Dockerisation', 'Monitoring'],
            srcBackground: 'uploads/projects/back-9.jpg'
        },
        {
            name: 'Formation Sécurité',
            description: 'Sessions de formation à la sécurité informatique',
            tasks: ['Planification sessions', 'Création des supports', 'Suivi participation'],
            srcBackground: 'uploads/projects/back-13.jpg'
        },
        {
            name: 'Projet R&D IA',
            description: 'Prototype d’outil d’analyse d’image par IA',
            tasks: ['Collecte de données', 'Entraînement du modèle', 'Évaluation des résultats'],
            srcBackground: 'uploads/projects/back-2.jpg'
        },
        {
            name: 'Support Client 24/7',
            description: 'Mise en place d’un support client automatisé',
            tasks: ['Choix du chatbot', 'Configuration scénarios', 'Suivi satisfaction'],
            srcBackground: 'uploads/projects/back-4.jpg'
        },
    ];

    for (const project of projectsData) {
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        await prisma.project.create({
            data: {
                name: project.name,
                description: project.description,
                srcBackground: project.srcBackground,
                assignedUsers: { connect: { id: randomUser.id } },
                tasks: {
                    create: project.tasks.map(title => ({
                        title,
                        status: 'TODO',
                        userId: randomUser.id,
                    })),
                }
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
