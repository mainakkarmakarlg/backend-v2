import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { DatabaseService } from 'src/database/database.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class LectureService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  create(createLectureDto: CreateLectureDto) {
    return 'This action adds a new lecture ';
  }

  async findAll(userId: number, platformId: number) {
    let courseId: number | null = null;
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (watching_courseId) {
      courseId = Number(watching_courseId);
    }

    if (!courseId) {
      throw new BadRequestException('You are not watching any course');
    }
    console.log(
      'courseId',
      courseId,
      'userId',
      userId,
      'platformId',
      platformId,
    );

    const lectures = await this.databaseService.lectureInfo.findMany({
      where: {
        Course: {
          some: {
            courseId: courseId,
          },
        },
      },
      orderBy: {},
    });

    // const tempSubjects = await this.databaseService.courseSubject.findMany({
    //   where: {
    //     Course: {
    //       some: {
    //         courseId: courseId,
    //       },
    //     },
    //   },
    //   include: {
    //     FallNumber: {
    //       include: {
    //         Fall: {
    //           include: {
    //             VideoInfo: {
    //               include: {
    //                 VideoInfo: {
    //                   include: {
    //                     Lecture: {
    //                       where: {
    //                         Lecture: {
    //                           Course: {
    //                             some: {
    //                               courseId: courseId,
    //                             },
    //                           },
    //                         },
    //                       },
    //                       include: {
    //                         Lecture: {
    //                           include: {
    //                             Course: true,
    //                           },
    //                         },
    //                       },
    //                     },
    //                     User: {
    //                       where: {
    //                         userId: userId,
    //                       },
    //                     },
    //                     UserFeedback: {
    //                       where: {
    //                         userId: userId,
    //                       },
    //                     },
    //                     UserFlag: {
    //                       where: {
    //                         userId: userId,
    //                       },
    //                     },
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //     Subjects: {
    //       include: {
    //         FallNumber: {
    //           include: {
    //             Fall: {
    //               include: {
    //                 VideoInfo: {
    //                   include: {
    //                     VideoInfo: {
    //                       include: {
    //                         Lecture: {
    //                           where: {
    //                             Lecture: {
    //                               Course: {
    //                                 some: {
    //                                   courseId: courseId,
    //                                 },
    //                               },
    //                             },
    //                           },
    //                           include: {
    //                             Lecture: {
    //                               include: {
    //                                 Course: true,
    //                               },
    //                             },
    //                           },
    //                         },
    //                         User: {
    //                           where: {
    //                             userId: userId,
    //                           },
    //                         },
    //                         UserFeedback: {
    //                           where: {
    //                             userId: userId,
    //                           },
    //                         },
    //                         UserFlag: {
    //                           where: {
    //                             userId: userId,
    //                           },
    //                         },
    //                       },
    //                     },
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //         Subjects: {
    //           include: {
    //             FallNumber: {
    //               include: {
    //                 Fall: {
    //                   include: {
    //                     VideoInfo: {
    //                       include: {
    //                         VideoInfo: {
    //                           include: {
    //                             Lecture: {
    //                               where: {
    //                                 Lecture: {
    //                                   Course: {
    //                                     some: {
    //                                       courseId: courseId,
    //                                     },
    //                                   },
    //                                 },
    //                               },
    //                               include: {
    //                                 Lecture: {
    //                                   include: {
    //                                     Course: true,
    //                                   },
    //                                 },
    //                               },
    //                             },
    //                             User: {
    //                               where: {
    //                                 userId: userId,
    //                               },
    //                             },
    //                             UserFeedback: {
    //                               where: {
    //                                 userId: userId,
    //                               },
    //                             },
    //                             UserFlag: {
    //                               where: {
    //                                 userId: userId,
    //                               },
    //                             },
    //                           },
    //                         },
    //                       },
    //                     },
    //                   },
    //                 },
    //               },
    //             },
    //             Subjects: {
    //               include: {
    //                 FallNumber: {
    //                   include: {
    //                     Fall: {
    //                       include: {
    //                         VideoInfo: {
    //                           include: {
    //                             VideoInfo: {
    //                               include: {
    //                                 Lecture: {
    //                                   where: {
    //                                     Lecture: {
    //                                       Course: {
    //                                         some: {
    //                                           courseId: courseId,
    //                                         },
    //                                       },
    //                                     },
    //                                   },
    //                                   include: {
    //                                     Lecture: {
    //                                       include: {
    //                                         Course: true,
    //                                       },
    //                                     },
    //                                   },
    //                                 },
    //                                 User: {
    //                                   where: {
    //                                     userId: userId,
    //                                   },
    //                                 },
    //                                 UserFeedback: {
    //                                   where: {
    //                                     userId: userId,
    //                                   },
    //                                 },
    //                                 UserFlag: {
    //                                   where: {
    //                                     userId: userId,
    //                                   },
    //                                 },
    //                               },
    //                             },
    //                           },
    //                         },
    //                       },
    //                     },
    //                   },
    //                 },
    //                 Subjects: {
    //                   include: {
    //                     FallNumber: {
    //                       include: {
    //                         Fall: {
    //                           include: {
    //                             VideoInfo: {
    //                               include: {
    //                                 VideoInfo: {
    //                                   include: {
    //                                     Lecture: {
    //                                       where: {
    //                                         Lecture: {
    //                                           Course: {
    //                                             some: {
    //                                               courseId: courseId,
    //                                             },
    //                                           },
    //                                         },
    //                                       },
    //                                       include: {
    //                                         Lecture: {
    //                                           include: {
    //                                             Course: true,
    //                                           },
    //                                         },
    //                                       },
    //                                     },
    //                                     User: {
    //                                       where: {
    //                                         userId: userId,
    //                                       },
    //                                     },
    //                                     UserFeedback: {
    //                                       where: {
    //                                         userId: userId,
    //                                       },
    //                                     },
    //                                     UserFlag: {
    //                                       where: {
    //                                         userId: userId,
    //                                       },
    //                                     },
    //                                   },
    //                                 },
    //                               },
    //                             },
    //                           },
    //                         },
    //                       },
    //                     },
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // const { subjects } = this.transformStructure(tempSubjects);

    // return {
    //   subjects,
    // };
  }

  async changeFalluNum(oldFallnumber: string, newFallnumber: string) {
    const fallNumber = await this.databaseService.fallNumber.findFirst({
      where: {
        number: oldFallnumber,
      },
    });
    if (!fallNumber) {
      return null;
    }
    const updatedFallNumber = await this.databaseService.fallNumber.update({
      where: {
        id: fallNumber.id,
      },
      data: {
        number: newFallnumber,
      },
    });
    return updatedFallNumber;
  }

  async addLecture(createLectureDto: CreateLectureDto) {
    const fallnumber = await this.databaseService.fallNumber.findFirst({
      where: {
        number: createLectureDto.fallNumber,
      },
    });
    const duration = createLectureDto.duration; // e.g., "01:32"
    const [hours, minutes] = duration.split(':').map(Number);
    const totalSeconds = hours * 3600 + minutes * 60;
    if (!fallnumber) {
      return;
    }
    let videoInfo = await this.databaseService.videoInfo.findFirst({
      where: {
        videoCode: createLectureDto.videoId,
      },
    });
    if (!videoInfo) {
      videoInfo = await this.databaseService.videoInfo.create({
        data: {
          videoCode: createLectureDto.videoId,
          duration: totalSeconds,
          type: createLectureDto.type,
        },
      });
    }
    const lecture = await this.databaseService.lectureInfo.create({
      data: {
        name: createLectureDto.name,
        remarks: createLectureDto.remarks,
        contentCovered: createLectureDto.content,
      },
    });
    await this.databaseService.fallNumberToVideoInfo.create({
      data: {
        fallNumberId: fallnumber.id,
        videoId: videoInfo.id,
      },
    });
    await this.databaseService.lectureToVideo.create({
      data: {
        lectureId: lecture.id,
        videoId: videoInfo.id,
      },
    });
    await this.databaseService.lectureToCourse.create({
      data: {
        lectureId: lecture.id,
        courseId: createLectureDto.courseId,
      },
    });
  }

  transformStructure(data: any) {
    const videoMap = new Map();

    for (const subject of data) {
      const subjectName = subject.name;

      for (const chapter of subject.Subjects || []) {
        const chapterName = chapter.name;

        for (const los of chapter.Subjects || []) {
          for (const fall of los.FallNumber || []) {
            const videoInfos = fall.Fall?.VideoInfo || [];

            for (const viWrapper of videoInfos) {
              const video = viWrapper.VideoInfo;
              const key = video.id;

              if (!videoMap.has(key)) {
                videoMap.set(key, {
                  videoData: { ...video },
                  subjectNames: new Set(),
                  chapterNames: new Set(),
                  subjects: [],
                });
              }

              const entry = videoMap.get(key);
              entry.subjectNames.add(subjectName);
              entry.chapterNames.add(chapterName);
              entry.subjects.push({
                id: los.id,
                name: los.name,
                subjectId: los.subjectId,
              });
            }
          }
        }
      }
    }

    const finalSubjectsMap = new Map();

    for (const {
      videoData,
      subjectNames,
      chapterNames,
      subjects,
    } of videoMap.values()) {
      const subjectKey = [...subjectNames].sort().join(', ');
      const chapterKey = [...chapterNames].sort().join(', ');

      const fullKey = subjectKey;

      if (!finalSubjectsMap.has(fullKey)) {
        finalSubjectsMap.set(fullKey, {
          name: subjectKey,
          type: 'subject',
          Subjects: [],
        });
      }

      const subjectEntry = finalSubjectsMap.get(fullKey);

      let chapter = subjectEntry.Subjects.find((ch) => ch.name === chapterKey);
      if (!chapter) {
        chapter = {
          name: chapterKey,
          type: 'chapter',
          VideoInfo: [],
          Subjects: [],
        };
        subjectEntry.Subjects.push(chapter);
      }

      chapter.VideoInfo.push({
        ...videoData,
        subjects, // renamed key in final output too
      });
    }

    return {
      subjects: Array.from(finalSubjectsMap.values()),
    };
  }
}
