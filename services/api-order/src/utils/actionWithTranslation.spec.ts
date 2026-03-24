import {
  getAllWithTranslation,
  createWithTranslation,
  getByIdWithTranslation,
  updateWithTranslation,
  deleteWithTranslation,
  getAllWithTranslationWithData,
} from './actionWithTranslation';

describe('actionWithTranslation', () => {
  const mockParentRepo = {
    save: jest.fn(),
    softDelete: jest.fn(),
    findOne: jest.fn(),
  };

  const mockChildRepo = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockParentDto = {
    fromEntity: jest.fn(),
    toEntity: jest.fn(),
  };

  const mockChildDto = {
    toEntity: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllWithTranslation', () => {
    it('should map parents and attach translations', async () => {
      const parents = [{ id: 1 }];
      mockParentRepo.findOne.mockResolvedValue({ id: 1 });
      mockChildRepo.findOne.mockResolvedValue({ id: 10, locale: 'en' });
      mockParentDto.fromEntity.mockReturnValue('dto');

      const result = await getAllWithTranslation({
        parentRepoClass: mockParentRepo,
        parentDtoClass: mockParentDto,
        childRepoClass: mockChildRepo,
        parentKeyForGetChild: 'parent',
        locale: 'en',
        parents,
        meta: {},
        relations: [],
        nestedParentChildWithTranslation: [],
      });

      expect(mockChildRepo.findOne).toHaveBeenCalled();
      expect(result.data).toEqual(['dto']);
    });
  });

  describe('createWithTranslation', () => {
    it('should save parent and child translation', async () => {
      const parentDto = { name: 'parent' };
      const childDto: any = { name: 'child' };

      mockParentDto.toEntity.mockReturnValue('parentEntity');
      mockParentRepo.save.mockResolvedValue({ id: 1 });

      mockChildDto.toEntity.mockReturnValue('childEntity');
      mockChildRepo.save.mockResolvedValue({ id: 10 });
      mockParentDto.fromEntity.mockReturnValue('result');

      const result = await createWithTranslation({
        patentDto: parentDto,
        childDto,
        parentKeyForUpdateChild: 'parent',
        parentRepoClass: mockParentRepo,
        parentDtoClass: mockParentDto,
        childRepoClass: mockChildRepo,
        childDtoClass: mockChildDto,
      });

      expect(mockParentRepo.save).toHaveBeenCalled();
      expect(mockChildRepo.save).toHaveBeenCalled();
      expect(result).toBe('result');
    });
  });

  describe('getByIdWithTranslation', () => {
    it('should get parent by id and attach translation', async () => {
      mockParentRepo.findOne.mockResolvedValue({ id: 1 });
      mockChildRepo.findOne.mockResolvedValue({ id: 10 });
      mockParentDto.fromEntity.mockReturnValue('result');

      const result = await getByIdWithTranslation({
        id: 1,
        parentRepoClass: mockParentRepo,
        parentDtoClass: mockParentDto,
        childRepoClass: mockChildRepo,
        parentKeyForGetChild: 'parent',
        locale: 'en',
        parent: { id: 1 },
        relations: [],
        nestedParentChildWithTranslation: [],
      });

      expect(mockChildRepo.findOne).toHaveBeenCalled();
      expect(result).toBe('result');
    });
  });

  describe('updateWithTranslation', () => {
    it('should update parent and create child translation if not exists', async () => {
      const parent = { id: 1 };
      mockParentRepo.save.mockResolvedValue({ id: 1 }); // update parent

      mockParentRepo.findOne.mockResolvedValue({ id: 1 }); // find for translation
      mockChildRepo.findOne.mockResolvedValue(null); // translation not found

      mockChildDto.toEntity.mockReturnValue('childEntity');
      mockChildRepo.save.mockResolvedValue({ id: 10 }); // create translation

      mockParentDto.fromEntity.mockReturnValue('result');

      const result = await updateWithTranslation({
        parent,
        parentEntity: {},
        patentDto: { locale: 'en' },
        childDto: {},
        parentKeyForUpdateChild: 'parent',
        parentRepoClass: mockParentRepo,
        parentDtoClass: mockParentDto,
        childRepoClass: mockChildRepo,
        childDtoClass: mockChildDto,
        relations: [],
      });

      expect(mockParentRepo.save).toHaveBeenCalled();
      expect(mockChildRepo.save).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should update parent and update child translation if exists', async () => {
      const parent = { id: 1 };
      mockParentRepo.save.mockResolvedValue({ id: 1 });

      mockParentRepo.findOne.mockResolvedValue({ id: 1 });
      mockChildRepo.findOne.mockResolvedValue({ id: 10 });

      mockChildDto.toEntity.mockReturnValue({});
      mockChildRepo.save.mockResolvedValue({ id: 10 });

      mockParentDto.fromEntity.mockReturnValue('result');

      const result = await updateWithTranslation({
        parent,
        parentEntity: {},
        patentDto: { locale: 'en' },
        childDto: {},
        parentKeyForUpdateChild: 'parent',
        parentRepoClass: mockParentRepo,
        parentDtoClass: mockParentDto,
        childRepoClass: mockChildRepo,
        childDtoClass: mockChildDto,
        relations: [],
      });

      expect(mockChildRepo.save).toHaveBeenCalled();
    });
  });

  describe('deleteWithTranslation', () => {
    it('should soft delete child translations and parent', async () => {
      mockParentRepo.findOne.mockResolvedValue({ id: 1 });
      mockChildRepo.find.mockResolvedValue([{ id: 10 }, { id: 11 }]);

      await deleteWithTranslation({
        id: 1,
        parentRepoClass: mockParentRepo,
        childRepoClass: mockChildRepo,
        parentKeyForGetChild: 'parent',
        relations: [],
      });

      expect(mockChildRepo.softDelete).toHaveBeenCalledTimes(2);
      expect(mockParentRepo.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('getAllWithTranslationWithData', () => {
    it('should map parents with data translations', async () => {
      const parents = [
        {
          id: 1,
          parentTranslations: [
            { locale: 'en', name: 'test' },
            { locale: 'th', name: 'thai' },
          ],
        },
      ];
      mockParentDto.fromEntity.mockReturnValue('dto');

      const result = await getAllWithTranslationWithData({
        parentRepoClass: mockParentRepo,
        parentDtoClass: mockParentDto,
        childRepoClass: mockChildRepo,
        parentKeyForGetChild: 'parent',
        locale: 'en',
        parents,
        meta: {},
        relations: [],
        nestedParentChildWithTranslation: [],
      });

      expect(result.data).toEqual(['dto']);
    });
  });
});
