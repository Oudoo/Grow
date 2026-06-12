
import { prisma } from '../src/lib/db';
import { ecosystem } from '../src/data/ecosystem';

async function main() {
  console.log('Start seeding...');

  for (const suiteData of ecosystem) {
    const { products, ...suiteDataWithoutProducts } = suiteData;
    
    // Upsert suite
    const suite = await prisma.suite.upsert({
      where: { slug: suiteData.slug },
      update: suiteDataWithoutProducts,
      create: suiteDataWithoutProducts,
    });
    
    console.log(`Upserted Suite: ${suite.suite}`);

    // Upsert products for this suite
    for (const productData of products) {
      await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {
          ...productData,
          suiteId: suite.id,
        },
        create: {
          ...productData,
          suiteId: suite.id,
        },
      });
      console.log(`  - Upserted Product: ${productData.name}`);
    }
  }

  console.log('Seeding Aura Launching Project...');
  const { launchProjectData } = await import('../src/data/seedProjects');
  
  // Upsert the project
  const project = await prisma.project.upsert({
    where: { id: "aura-launching" }, // Use ID if it exists
    update: {
      title: launchProjectData.title,
      description: launchProjectData.description,
    },
    create: {
      title: launchProjectData.title,
      description: launchProjectData.description,
    }
  }).catch(async () => {
    // If upsert fails because we don't have a unique field or ID doesn't exist
    const existing = await prisma.project.findFirst({ where: { title: launchProjectData.title } });
    if (existing) return existing;
    return prisma.project.create({
      data: {
        title: launchProjectData.title,
        description: launchProjectData.description,
      }
    });
  });

  // Seed tasks
  for (const taskData of launchProjectData.tasks) {
    const task = await prisma.task.findFirst({
      where: { title: taskData.title, projectId: project.id }
    }) || await prisma.task.create({
      data: {
        title: taskData.title,
        status: taskData.status,
        assignee: taskData.assignee,
        projectId: project.id,
      }
    });

    console.log(`  - Seeded Task: ${task.title}`);

    // Seed subtasks
    for (const subTitle of taskData.subTasks) {
      const existingSubTask = await prisma.subTask.findFirst({
        where: { title: subTitle, taskId: task.id }
      });
      if (!existingSubTask) {
        await prisma.subTask.create({
          data: {
            title: subTitle,
            taskId: task.id,
          }
        });
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
